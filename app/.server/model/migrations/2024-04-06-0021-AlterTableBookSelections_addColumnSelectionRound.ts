import { Kysely } from "kysely";
import { DB, Vote } from "kysely-codegen";
import {
  BOOK_SELECTIONS,
  SELECTION_ROUNDS,
  VOTES,
} from "~/.server/model/tables";
import { solveRankedVoting } from "~/.server/model/votes";

const selectionRoundIdColumn = "selectionRoundId";

const selectionRoundIdConstraint = "selectionRoundIdConstraint";

export async function up(kysely: Kysely<DB>) {
  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .addColumn(selectionRoundIdColumn, "integer", (col) => col)
    .execute();

  console.log("Fetching votes");

  const votes = await kysely.selectFrom(VOTES).selectAll().execute();

  const votesBySelectionRound = new Map<number, Array<Vote>>();
  for (let vote of votes) {
    const selectionRoundId = vote.votingRound;
    if (!votesBySelectionRound.has(selectionRoundId)) {
      votesBySelectionRound.set(selectionRoundId, []);
    }
    votesBySelectionRound.get(selectionRoundId)!.push(vote);
  }

  for (let [selectionRoundId, votes] of votesBySelectionRound) {
    const winner = solveRankedVoting(votes);
    if (!winner) {
      continue;
    }
    // @ts-expect-error
    await kysely
      .insertInto(BOOK_SELECTIONS)
      .values({
        clubId: votes[0].clubId,
        bookId: winner.bookId,
        selectedAt: new Date(),
        selectionRoundId,
      })
      .execute();
  }

  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .addForeignKeyConstraint(
      selectionRoundIdConstraint,
      [selectionRoundIdColumn],
      SELECTION_ROUNDS,
      ["id"],
    )
    .execute();
}

export async function down(kysely: Kysely<DB>) {
  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .dropConstraint(selectionRoundIdConstraint)
    .execute();
  await kysely.schema
    .alterTable(BOOK_SELECTIONS)
    .dropColumn(selectionRoundIdColumn)
    .execute();
}
