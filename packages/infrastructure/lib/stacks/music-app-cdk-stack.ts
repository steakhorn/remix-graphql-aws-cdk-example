import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Database } from "../constructs/database";
import { Api } from "../constructs/api";
import { Webapp } from "../constructs/webapp";

export class MusicAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, `Vpc`);

    const database = new Database(this, `MusicDatabase`, { vpc });

    const api = new Api(this, `MusicApi`, {
      vpc,
      database: {
        /**
         * We're directly referencing host and port here because using secrets in
         * this case would result in failing to refresh the value:
         * See: https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/369
         */
        host: database.instance.instanceEndpoint.hostname,
        port: cdk.Token.asString(database.instance.instanceEndpoint.port),
        engine: database.secret.secretValueFromJson("engine").toString(),
        dbname: database.dbname,
        /**
         * We're using the master DB user here for simplicity. In a real production app,
         * we'd create a DB user with appropriate priveleges.
         * See: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.MasterAccounts.html
         */
        username: database.secret.secretValueFromJson("username").toString(),
        password: database.secret.secretValueFromJson("password").toString(),
      },
    });

    const webapp = new Webapp(this, "MusicApp", {
      graphqlUrl: api.graphqlUrl,
      graphqlApiKey: api.apiKey!,
    });
  }
}
