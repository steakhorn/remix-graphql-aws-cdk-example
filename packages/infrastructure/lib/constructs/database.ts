import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

/**
 * This construct contains the database for this app, as well as the associated
 * VPC and security group. RDS databases are not publicly available, so we're
 * accessing it via Lambdas with inbound access to the DB's security group.
 */

interface DatabaseProps {
  region?: string;
  vpc: ec2.IVpc;
}

export class Database extends Construct {
  readonly instance: rds.DatabaseInstance;
  readonly secret: secretsmanager.ISecret;
  readonly dbname: string = "musicdb";

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    const vpc = props.vpc;

    const postgres = new rds.DatabaseInstance(this, "Postgres", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_1,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MEDIUM
      ),
      databaseName: this.dbname,
      vpc,
      /**
       * The following makes this database's endpoint publicly accessible
       * (i.e. it can be reached from outside the VPC - it's still protected
       * by a username + password). Ideally, in production you would keep
       * the endpoint private and only access it via EC2 or Lambdas within
       * the VPC. But that adds complexity to infrastructure required for
       * development, so for this example I'm keeping it simple.
       */
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    postgres.connections.allowFromAnyIpv4(ec2.Port.tcp(5432));

    this.instance = postgres;
    this.secret = postgres.secret!;

    new cdk.CfnOutput(this, "DatabaseEndpointHostname", {
      value: postgres.instanceEndpoint.hostname,
    });
    new cdk.CfnOutput(this, "DatabaseEndpointPort", {
      value: cdk.Token.asString(postgres.instanceEndpoint.port),
    });
  }
}
