import path from "path";
import fs from "fs";
import YAML from "yaml";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import { resolvers } from "@shanecav-example-project/api";
import { DatabaseConnectionProps, PrismaFunction } from "./prisma-function";

interface ApplicationProps {
  vpc: ec2.IVpc;
  database: DatabaseConnectionProps;
}

export class Api extends Construct {
  readonly graphqlUrl: string;
  readonly apiKey?: string;

  constructor(scope: Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const vpc = props.vpc;

    const securityGroup = new ec2.SecurityGroup(this, `SecurityGroup`, {
      vpc: props.vpc,
    });

    /**
     * AppSync + data source lambda
     */

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "music-appsync-api",
      schema: appsync.Schema.fromAsset(
        path.join(__dirname, "../../../api/schema.graphql")
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            /**
             * This app is designed so that the API key is the authorization
             * method used for publicly available requests to our API. So in
             * this case the API is not a secret that we need to protect. If
             * you want to add more types of authentication then you can add
             * additional authorization configs to this API.
             *
             * Examples:
             * - Cognito for authorizing logged in users
             * - IAM for giving a Lambda more permissions
             *
             * The API key's expiration date will get refreshed to 365 days
             * from every time a new CDK deployment happens. So just make
             * sure you don't let an app sit for a year with no deployments :)
             */
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    const apiDataSourceLambda = new PrismaFunction(
      this,
      "ApiDataSourceLambda",
      {
        entry: path.join(
          __dirname,
          "../../../api/lambda-fns/appsync-data-source.ts"
        ),
        memorySize: 1024,
        timeout: cdk.Duration.seconds(15),
        vpc,
        securityGroups: [securityGroup],
        database: props.database,
      }
    );

    const lambdaDs = api.addLambdaDataSource(
      "LambdaDatasource",
      apiDataSourceLambda
    );

    for (let { typeName, fieldName } of resolvers) {
      lambdaDs.createResolver({ typeName, fieldName });
    }

    /**
     * We attempt to read a graphcdn.yml file (if there is one) to get the
     * service name to build the GraphQL endpoint URL. Otherwise, we fall
     * back to the AppSync endpoint URL.
     *
     * If you're using a custom domain with GraphCDN, or there's some other
     * reason you need a different endpoint, change this code as needed.
     */
    try {
      const graphcdnConfigFile = fs.readFileSync(
        path.join(__dirname, "../../graphcdn.yml"),
        "utf8"
      );
      const graphcdnConfig = YAML.parse(graphcdnConfigFile);
      if (typeof graphcdnConfig.name === "string") {
        this.graphqlUrl = `https://${graphcdnConfig.name}.graphcdn.app`;
      } else {
        throw new Error("Couldn't find GraphCDN service name");
      }
    } catch (err) {
      this.graphqlUrl = api.graphqlUrl;
    }
    new cdk.CfnOutput(this, "GraphQlAPIURL", {
      value: this.graphqlUrl,
    });

    this.apiKey = api.apiKey;
    new cdk.CfnOutput(this, "AppSyncAPIKey", {
      value: this.apiKey || "",
    });

    new cdk.CfnOutput(this, `ApiDataSourceLambdaArn`, {
      value: apiDataSourceLambda.functionArn,
    });
  }
}
