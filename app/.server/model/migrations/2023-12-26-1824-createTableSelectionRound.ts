import { Kysely } from "kysely";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable("bookSuggestions")
    .addColumn("userId", "varchar", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable("selectionRounds")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("selectedBookId", "integer")
    .addColumn("state", "varchar", (col) => col.notNull())
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable("bookSuggestions")
    .dropColumn("userId")
    .execute();

  await kysely.schema.dropTable("selectionRounds").execute();
}
