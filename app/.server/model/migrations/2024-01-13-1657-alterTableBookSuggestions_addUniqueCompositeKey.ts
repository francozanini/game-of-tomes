import { Kysely } from "kysely";
import { BOOK_SUGGESTIONS } from "~/.server/model/tables/tableNames";

const constraintName = "unique_suggestion_for_round";

const selectionRoundId = "selectionRoundId";

export async function up(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .addColumn(selectionRoundId, "integer", (col) => col.notNull())
    .execute();

  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .addUniqueConstraint(constraintName, [
      "bookId",
      "clubId",
      selectionRoundId,
      "userId",
    ])
    .execute();
}

export async function down(kysely: Kysely<any>) {
  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .dropConstraint(constraintName)
    .execute();

  await kysely.schema
    .alterTable(BOOK_SUGGESTIONS)
    .dropColumn(selectionRoundId)
    .execute();
}
