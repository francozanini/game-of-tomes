import { Kysely } from "kysely";
import { DB } from "kysely-codegen";
import { VOTES } from "~/.server/model/tables/tableNames";

export async function up(kysely: Kysely<DB>) {
  await kysely.schema
    .alterTable(VOTES)
    .addColumn("rank", "integer", (col) => col.notNull())
    .execute();
}

export async function down(kysely: Kysely<DB>) {
  await kysely.schema.alterTable(VOTES).dropColumn("rank").execute();
}
