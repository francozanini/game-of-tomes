import { Kysely, sql } from "kysely";
import {
  BOOK_SELECTIONS,
  BOOK_SUGGESTIONS,
  BOOKS,
  VOTES,
} from "~/.server/model/tables";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .alterColumn("bookId", (col) => col.setDataType("varchar"))
    .execute();

  await kysely.schema
    .alterTable(BOOKS)
    .alterColumn("id", (col) => col.setDataType("varchar"))
    .execute();

  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .alterColumn("bookId", (col) => col.setDataType("varchar"))
    .execute();

  await kysely.schema
    .alterTable(VOTES)
    .alterColumn("bookId", (col) => col.setDataType("varchar"))
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .alterColumn("bookId", (col) =>
      col.setDataType(sql`integer USING "bookId"::integer`),
    )
    .execute();

  await kysely.schema
    .alterTable(BOOKS)
    .alterColumn("id", (col) =>
      col.setDataType(sql`integer USING "id"::integer`),
    )
    .execute();

  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .alterColumn("bookId", (col) =>
      col.setDataType(sql`integer USING "bookId"::integer`),
    )
    .execute();

  await kysely.schema
    .alterTable(VOTES)
    .alterColumn("bookId", (col) =>
      col.setDataType(sql`integer USING "bookId"::integer`),
    )
    .execute();
}
