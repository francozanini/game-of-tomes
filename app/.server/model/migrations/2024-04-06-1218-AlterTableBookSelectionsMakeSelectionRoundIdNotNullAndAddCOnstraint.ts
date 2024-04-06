import { DB } from "kysely-codegen";
import { BOOK_SELECTIONS } from "~/.server/model/tables";
import { Kysely } from "kysely";

const UniqueSelectionRoundAndBookClubConstraint =
  "UniqueSelectionRoundAndBookClubConstraint";

export async function up(kysely: Kysely<DB>) {
  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .alterColumn("selectionRoundId", (col) => col.setNotNull())
    .execute();

  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .addUniqueConstraint(UniqueSelectionRoundAndBookClubConstraint, [
      "selectionRoundId",
      "clubId",
    ])
    .execute();
}

export async function down(kysely: Kysely<DB>) {
  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .alterColumn("selectionRoundId", (col) => col.dropNotNull())
    .execute();

  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .dropConstraint(UniqueSelectionRoundAndBookClubConstraint)
    .execute();
}
