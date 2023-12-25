import { Kysely, sql } from "kysely";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .createTable("user")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("externalId", "varchar", (col) => col.notNull().unique())
    .addColumn("deleted", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("username", "varchar", (col) => col.notNull())
    .addColumn("email", "varchar", (col) => col.notNull())
    .addColumn("imageUrl", "varchar")
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema.dropTable("user").execute();
}
