import { DB, Vote } from "kysely-codegen";
import { Transaction } from "kysely";
import { solveRankedVoting } from "~/.server/model/votes";
import { db } from "./db";
import { BOOK_SELECTIONS } from "~/.server/model/tables";

async function decideBookSelection(votes: Array<Vote>, trx?: Transaction<DB>) {
  const winner = solveRankedVoting(votes);

  if (!winner) {
    return;
  }

  const dbOrTrx = trx || db;

  return await dbOrTrx
    .insertInto(BOOK_SELECTIONS)
    .values({
      clubId: votes[0].clubId,
      bookId: winner.bookId,
      selectedAt: new Date(),
    })
    .execute();
}

export { decideBookSelection };
