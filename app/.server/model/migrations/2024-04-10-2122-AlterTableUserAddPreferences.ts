import { Kysely, sql } from "kysely";
import { DB } from "kysely-codegen";
import { USERS } from "~/.server/model/tables/tableNames";

export async function up(kysely: Kysely<DB>) {
  await kysely.schema
    .createType("user_language")
    .asEnum(["en", "es"])
    .execute();

  await kysely.schema
    .alterTable(USERS)
    .addColumn("lang", sql`user_language`, (col) => col.defaultTo("es"))
    .execute();
}

export async function down(kysely: Kysely<DB>) {
  await kysely.schema.alterTable(USERS).dropColumn("lang").execute();

  await kysely.schema.dropType("user_language").execute();
}
