import Pool from "pg-pool";
import { Kysely, PostgresDialect } from "kysely";
import { singleton } from "~/utils/singleton.server";
import type { DB } from "kysely-codegen";

function createKyselyPostgres() {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  });
  return new Kysely<DB>({
    dialect,
    log: ["query", "error"],
  });
}

export const db = singleton("db", () => createKyselyPostgres());
