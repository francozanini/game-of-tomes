import { Database } from "~/.server/model/tables/schema";
import Pool from "pg-pool";
import { Kysely, PostgresDialect } from "kysely";
import { singleton } from "~/utils/singleton.server";

function createKyselyPostgres() {
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: "game_of_tomes",
      host: "127.0.0.1",
      user: "admin",
      password: "S3cret",
      port: 5432,
      max: 10,
    }),
  });
  return new Kysely<Database>({
    dialect,
  });
}

export const db = singleton("db", () => createKyselyPostgres());
