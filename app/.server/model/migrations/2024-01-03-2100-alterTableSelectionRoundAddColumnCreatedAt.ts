import { Kysely } from "kysely";
import { SELECTION_ROUNDS } from "../tables";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(SELECTION_ROUNDS)
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo("now()"),
    )
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(SELECTION_ROUNDS)
    .dropColumn("createdAt")
    .execute();
}
