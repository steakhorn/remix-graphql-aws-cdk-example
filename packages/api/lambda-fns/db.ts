import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});
