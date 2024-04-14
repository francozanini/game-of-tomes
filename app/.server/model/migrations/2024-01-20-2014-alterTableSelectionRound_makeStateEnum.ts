import { Kysely, sql } from "kysely";
import { SELECTION_ROUNDS } from "~/.server/model/tables/tableNames";
import { DB } from "kysely-codegen";

const roundStateTypeName = "selection_round_state";

export async function up(kysely: Kysely<DB>) {
  await kysely.schema
    .createType(roundStateTypeName)
    .asEnum(["suggesting", "voting", "finished"])
    .execute();

  await kysely.schema
    .alterTable(SELECTION_ROUNDS)
    .alterColumn("state", (col) =>
      col.setDataType(
        sql`selection_round_state USING state::selection_round_state`,
      ),
    )
    .execute();
}

export async function down(kysely: Kysely<DB>) {
  await kysely.schema.dropType(roundStateTypeName).execute();

  await kysely.schema
    .alterTable(SELECTION_ROUNDS)
    .alterColumn("state", (col) => col.setDataType("varchar(255)"))
    .execute();
}
