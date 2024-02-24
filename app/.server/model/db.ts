import Pool from "pg-pool";
import { Kysely, PostgresDialect } from "kysely";
import { singleton } from "~/utils/singleton.server";
import type { DB } from "kysely-codegen";
import "dotenv/config";

function createKyselyPostgres() {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://admin:S3cret@localhost:5432/game_of_tomes",
    }),
  });
  return new Kysely<DB>({
    dialect,
    log: ["query", "error"],
  });
}

export const db = singleton("db", () => createKyselyPostgres());
