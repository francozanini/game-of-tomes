import { Kysely } from "kysely";
import { BOOK_SUGGESTIONS, SELECTION_ROUNDS } from "../tables";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .addColumn("userId", "varchar", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable(SELECTION_ROUNDS)
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("selectedBookId", "integer")
    .addColumn("state", "varchar", (col) => col.notNull())
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .dropColumn("userId")
    .execute();

  await kysely.schema.dropTable(SELECTION_ROUNDS).execute();
}
