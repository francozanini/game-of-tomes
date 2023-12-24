import { Database } from "./schema.server";
import Pool from "pg-pool";
import { Kysely, PostgresDialect } from "kysely";
import { singleton } from "~/utils/singleton.server";

export const db = singleton("db", () => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: "game_of_tomes",
      host: "localhost",
      user: "admin",
      password: "S3cret",
      port: 5432,
      max: 10,
    }),
  });

  return new Kysely<Database>({
    dialect,
  });
});
