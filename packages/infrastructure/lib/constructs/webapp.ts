import path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as origin from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as synthetics from "@aws-cdk/aws-synthetics-alpha";

/**
 * This construct contains:
 * - An S3 bucket that holds the static assets for the Remix app
 * - A CloudFront distribution that uses the above S3 bucket as its origin
 *   - A Lambda @ Edge function for the Remix app server-side rendering
 */

interface WebappStackProps {
  graphqlUrl: string;
  graphqlApiKey: string;
}

export class Webapp extends Construct {
  constructor(scope: Construct, id: string, props: WebappStackProps) {
    super(scope, id);

    const assetsBucket = new s3.Bucket(this, "AssetsBucket", {
      autoDeleteObjects: true,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const assetsBucketOriginAccessIdentity =
      new cloudfront.OriginAccessIdentity(
        this,
        "AssetsBucketOriginAccessIdentity"
      );

    const assetsBucketS3Origin = new origin.S3Origin(assetsBucket, {
      originAccessIdentity: assetsBucketOriginAccessIdentity,
      customHeaders: {
        graphqlApiKey: props.graphqlApiKey,
        graphqlUrl: props.graphqlUrl,
      },
    });

    assetsBucket.grantRead(assetsBucketOriginAccessIdentity);

    const bucketDeployment = new s3deploy.BucketDeployment(
      this,
      "AssetsDeployment",
      {
        destinationBucket: assetsBucket,
        prune: true,
        sources: [
          s3deploy.Source.asset(path.join(__dirname, "../../../remix/public")),
        ],
        cacheControl: [
          s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
          s3deploy.CacheControl.sMaxAge(cdk.Duration.days(365)),
        ],
      }
    );

    const edgeFn = new lambdanode.NodejsFunction(this, "EdgeFn", {
      currentVersionOptions: {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
      entry: path.join(__dirname, "../../../remix/server/index.ts"),
      /**
       * isomorphic-dompurify depends on jsdom, which has "canvas" as an optional
       * dependency. This prevents it from being included in the bundle, which
       * breaks the cdk build. Adding it to `nodeModules` here causes it (and its
       * dependencies) to be installed by npm rather than bundled.
       * See: https://github.com/kkomelin/isomorphic-dompurify/issues/54.
       */
      bundling: { nodeModules: ["isomorphic-dompurify"] },
      logRetention: logs.RetentionDays.THREE_DAYS,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
    });
    /**
     * The webapp's public assets must be uploaded *before* the Edge function is
     * created/updated, otherwise the Remix server will try to reference assets
     * that aren't yet available.
     */
    edgeFn.node.addDependency(bucketDeployment);

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        compress: true,
        edgeLambdas: [
          {
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            functionVersion: edgeFn.currentVersion,
            includeBody: true,
          },
        ],
        origin: assetsBucketS3Origin,
        originRequestPolicy: new cloudfront.OriginRequestPolicy(
          this,
          "OriginRequestPolicy",
          {
            headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(),
            queryStringBehavior:
              cloudfront.OriginRequestQueryStringBehavior.all(),
            cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
          }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "build/*": {
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
          origin: assetsBucketS3Origin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    /**
     * Dummy S3 deployment just used to invalidate the CloudFront distribution's cache.
     * This can't be done in our "real" S3 deployment because that deployment has to
     * happen before the Edge function (defined in the distribution) is created.
     */
    new s3deploy.BucketDeployment(this, "DistributionInvalidator", {
      destinationBucket: assetsBucket,
      distribution,
      sources: [
        s3deploy.Source.data("distributionInvalidator", `${Date.now()}`),
      ],
      prune: false, // IMPORTANT!!! Omitting this will remove all other items from the bucket.
    });

    const canary = new synthetics.Canary(this, "MyCanary", {
      schedule: synthetics.Schedule.rate(cdk.Duration.minutes(5)),
      test: synthetics.Test.custom({
        code: synthetics.Code.fromAsset(
          path.join(__dirname, "../../../remix/canary")
        ),
        handler: "index.handler",
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_3,
      environmentVariables: {
        domain: distribution.distributionDomainName,
      },
    });

    new cdk.CfnOutput(this, `CloudFrontDomain`, {
      value: distribution.distributionDomainName,
    });
  }
}
