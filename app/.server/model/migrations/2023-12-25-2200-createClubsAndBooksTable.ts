import { Kysely, sql } from "kysely";
import {
  BOOKS,
  BOOK_SELECTIONS,
  BOOK_SUGGESTIONS,
  CLUBS,
  CLUB_MEMBERS,
  USERS,
  VOTES,
} from "../tables";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .createTable(CLUBS)
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("imageUrl", "varchar")
    .addColumn("ownerId", "integer", (col) => col.notNull())
    .addColumn("deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await kysely.schema
    .createTable(CLUB_MEMBERS)
    .ifNotExists()
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("userId", "varchar", (col) => col.notNull())
    .addForeignKeyConstraint("clubIdConstraint", ["clubId"], CLUBS, ["id"])
    .addForeignKeyConstraint("userIdConstraint", ["userId"], USERS, ["id"])
    .execute();

  await kysely.schema
    .createTable(BOOKS)
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("imageUrl", "varchar")
    .addColumn("deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await kysely.schema
    .createTable(BOOK_SUGGESTIONS)
    .ifNotExists()
    .addColumn("bookId", "integer", (col) => col.notNull())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable(VOTES)
    .ifNotExists()
    .addColumn("bookId", "integer", (col) => col.notNull())
    .addColumn("userId", "varchar", (col) => col.notNull())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("votingRound", "integer", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable(BOOK_SELECTIONS)
    .ifNotExists()
    .addColumn("bookId", "integer", (col) => col.notNull())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("selectedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema.dropTable(CLUBS).cascade().execute();
  await kysely.schema.dropTable(BOOKS).cascade().execute();
  await kysely.schema.dropTable(CLUB_MEMBERS).cascade().execute();
  await kysely.schema.dropTable(BOOK_SUGGESTIONS).cascade().execute();
  await kysely.schema.dropTable(VOTES).cascade().execute();
  await kysely.schema.dropTable(BOOK_SELECTIONS).cascade().execute();
}
