import { db } from "~/.server/model/db";
import { VOTES } from "~/.server/model/tables";

export function registerOrChangeVotes(
  votes: string[],
  votingRound: number,
  clubId: number,
  userId: string,
) {
  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom(VOTES)
      .where("votingRound", "=", votingRound)
      .where("userId", "=", userId)
      .execute();

    return await trx
      .insertInto(VOTES)
      .values(
        votes.map((bookId) => ({
          bookId,
          clubId,
          userId,
          votingRound,
        })),
      )
      .returningAll()
      .execute();
  });
}
