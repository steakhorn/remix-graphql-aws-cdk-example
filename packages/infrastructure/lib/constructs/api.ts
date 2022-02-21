import path from "path";
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

    new cdk.CfnOutput(this, "AppSyncAPIURL", {
      value: api.graphqlUrl,
    });
    this.graphqlUrl = api.graphqlUrl;

    new cdk.CfnOutput(this, "AppSyncAPIKey", {
      value: api.apiKey || "",
    });
    this.apiKey = api.apiKey;

    new cdk.CfnOutput(this, `ApiDataSourceLambdaArn`, {
      value: apiDataSourceLambda.functionArn,
    });
  }
}
