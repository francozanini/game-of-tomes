import { Kysely, sql } from "kysely";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .createTable("clubs")
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
    .createTable("clubMembers")
    .ifNotExists()
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("userId", "integer", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable("books")
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
    .createTable("suggestions")
    .ifNotExists()
    .addColumn("bookId", "integer", (col) => col.notNull())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable("votes")
    .ifNotExists()
    .addColumn("bookId", "integer", (col) => col.notNull())
    .addColumn("userId", "integer", (col) => col.notNull())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("votingRound", "integer", (col) => col.notNull())
    .execute();

  await kysely.schema
    .createTable("selections")
    .ifNotExists()
    .addColumn("bookId", "integer", (col) => col.notNull())
    .addColumn("clubId", "integer", (col) => col.notNull())
    .addColumn("selectedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema.dropTable("clubs").execute();
  await kysely.schema.dropTable("books").execute();
  await kysely.schema.dropTable("clubMembers").execute();
  await kysely.schema.dropTable("suggestions").execute();
  await kysely.schema.dropTable("votes").execute();
  await kysely.schema.dropTable("selections").execute();
}
