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
        votes.map((bookId, index) => ({
          bookId,
          clubId,
          userId,
          votingRound,
          rank: index + 1,
        })),
      )
      .returningAll()
      .execute();
  });
}

export function findVotes(userId: string, selectionRoundId: number) {
  return db
    .selectFrom(VOTES)
    .select("bookId")
    .where("userId", "=", userId)
    .where("votingRound", "=", selectionRoundId)
    .orderBy("rank asc")
    .execute();
}
