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

export function findVotes(userId: string | null, selectionRoundId: number) {
  return db
    .selectFrom(VOTES)
    .select(["bookId", "userId", "rank"])
    .$if(!!userId?.length, (qb) => qb.where("userId", "=", userId))
    .where("votingRound", "=", selectionRoundId)
    .orderBy("rank asc")
    .execute();
}

export function calculateWinner(votes: Awaited<ReturnType<typeof findVotes>>) {
  if (votes.length === 0) {
    return null;
  }

  debugger;

  const firstPlacesByBookId = new Map<string, number>();
  for (const vote of votes) {
    if (vote.rank === 1) {
      if (!firstPlacesByBookId.has(vote.bookId)) {
        firstPlacesByBookId.set(vote.bookId, 1);
      } else {
        firstPlacesByBookId.set(
          vote.bookId,
          firstPlacesByBookId.get(vote.bookId)! + 1,
        );
      }
    }
  }

  const booksOrderedByFirstPlaces = Array.from(firstPlacesByBookId.entries())
    .sort((a, b) => b[1] - a[1])
    .map((book) => ({ bookId: book[0], firstPlaces: book[1] }));

  const bookWithMostFirstPlaces = booksOrderedByFirstPlaces[0];

  if (
    bookWithMostFirstPlaces.firstPlaces >
    booksOrderedByFirstPlaces.length / 2
  ) {
    return bookWithMostFirstPlaces;
  }

  const bookWithLeastFirstPlaces =
    booksOrderedByFirstPlaces[booksOrderedByFirstPlaces.length - 1];

  const usersThatVotedForBookWithLeastFirstPlaces = votes
    .filter(
      (vote) =>
        vote.rank === 1 && vote.bookId === bookWithLeastFirstPlaces.bookId,
    )
    .map((vote) => vote.userId);

  return calculateWinner(
    votes
      .map((vote) =>
        usersThatVotedForBookWithLeastFirstPlaces.includes(vote.userId)
          ? { ...vote, rank: vote.rank - 1 }
          : vote,
      )
      .filter((vote) => vote.bookId !== bookWithLeastFirstPlaces.bookId),
  );
}

export async function rankedChoices(selectionRoundId: number) {
  const votes = await findVotes(null, selectionRoundId);
  return calculateWinner(votes);
}
