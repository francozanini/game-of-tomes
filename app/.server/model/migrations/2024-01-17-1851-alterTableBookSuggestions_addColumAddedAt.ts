import { Kysely, sql } from "kysely";
import { BOOK_SUGGESTIONS } from "~/.server/model/tables/tableNames";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .addColumn("addedAt", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .dropColumn("addedAt")
    .execute();
}
