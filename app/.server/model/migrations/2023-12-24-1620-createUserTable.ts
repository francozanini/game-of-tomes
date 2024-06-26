import { Kysely, sql } from "kysely";
import { USERS } from "../tables/tableNames";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .createTable(USERS)
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
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
  await kysely.schema.dropTable(USERS).execute();
}
