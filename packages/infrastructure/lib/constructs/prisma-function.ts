import path from "path";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

/**
 * This construct is used to create Lambda functions that run Prisma
 * operations on the database. Right now, that's just the AppSync
 * data source, which only requires the Prisma Client and an
 * appropriate query engine.
 *
 * In the future this could also be used for creating Lambdas for
 * database migrations, etc. There's (currently) a ton of complexity
 * required to get the Prisma CLI to run on a Lambda, which is necessary
 * for initializing the database and running migrations. So I haven't
 * implemented that in this package.
 */

export interface DatabaseConnectionProps {
  host: string;
  port: string;
  engine: string;
  username: string;
  password: string;
  dbname: string;
}

interface PrismaFunctionProps extends lambdanode.NodejsFunctionProps {
  database: DatabaseConnectionProps;
}

export class PrismaFunction extends lambdanode.NodejsFunction {
  constructor(scope: Construct, id: string, props: PrismaFunctionProps) {
    const { host, port, engine, username, password, dbname } = props.database;
    const dbUrl = `${engine}://${username}:${password}@${host}:${port}/${dbname}?connection_limit=1`;

    super(scope, id, {
      ...props,
      environment: {
        ...props.environment,
        DATABASE_HOST: host,
        DATABASE_PORT: port,
        DATABASE_ENGINE: engine,
        DATABASE_USER: username,
        DATABASE_PASSWORD: password,
        DATABASE_URL: dbUrl,
      },
      bundling: {
        nodeModules: ["prisma", "@prisma/client"].concat(
          props.bundling?.nodeModules ?? []
        ),
        commandHooks: {
          beforeInstall: (i, o) => [
            /**
             * Copy the prisma directory to Lambda code asset. It must be located in
             * the same directory as your Lambda code.
             */
            `cp -R ${path.join(i, "packages/api/prisma")} ${o}`,
          ],
          beforeBundling: (i, o) => [],
          afterBundling: (i, o) => [
            `cd ${o}`,
            `pwd`,
            `npx prisma generate`,
            `rm -rf node_modules/.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node`,
            `rm -rf node_modules/@prisma/engines/introspection-engine-debian-openssl-1.1.x`,
            `rm -rf node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node`,
            `rm -rf node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x`,
            `rm -rf node_modules/@prisma/engines/prisma-fmt-debian-openssl-1.1.x`,
            `rm -rf node_modules/prisma/libquery_engine-debian-openssl-1.1.x.so.node`,
          ],
        },
      },
    });
  }
}
