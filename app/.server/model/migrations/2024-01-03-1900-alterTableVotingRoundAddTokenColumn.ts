import { Kysely } from "kysely";
import { SELECTION_ROUNDS } from "../tables";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(SELECTION_ROUNDS)
    .addColumn("inviteToken", "varchar", (col) => col.notNull())
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(SELECTION_ROUNDS)
    .dropColumn("inviteToken")
    .execute();
}
