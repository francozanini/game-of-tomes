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

function bordaCount(
  allLeastVotedBooks: string[],
  votersToBallots: Map<string, string[]>,
) {
  const loserBookIds: Array<string> = [];
  const bookToBordaScore = new Map<string, number>();

  for (const book of allLeastVotedBooks) {
    bookToBordaScore.set(book, 0);
  }

  for (const [, ballots] of votersToBallots) {
    for (const book of allLeastVotedBooks) {
      const rank = ballots.findIndex((ballot) => ballot === book);
      if (rank !== -1) {
        const bordaPointsToAdd = allLeastVotedBooks.length - rank;
        bookToBordaScore.set(
          book,
          bookToBordaScore.get(book)! + bordaPointsToAdd,
        );
      }
    }
  }

  const sortedBooks = Array.from(bookToBordaScore.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  // console.log("sortedBooks", sortedBooks);
  const votesNeededToBeLastPlace = sortedBooks[sortedBooks.length - 1][1];
  const booksWithLastPlace = sortedBooks.filter(
    (book) => book[1] === votesNeededToBeLastPlace,
  );
  loserBookIds.push(...booksWithLastPlace.map((book) => book[0]));

  return loserBookIds;
}

export function solveRankedVoting(
  votes: Awaited<ReturnType<typeof findVotes>>,
) {
  if (votes.length === 0) {
    return null;
  }

  const votersToBallots = new Map<string, string[]>();
  for (const vote of votes) {
    const ballots = votersToBallots.get(vote.userId) ?? [];
    ballots[vote.rank - 1] = vote.bookId;
    votersToBallots.set(vote.userId, ballots);
  }

  const loserBookIds: Array<string> = [];

  let winner = null;

  while (winner === null) {
    const bookToVotes = new Map<string, number>();
    for (const [, ballots] of votersToBallots) {
      const firstChoice = ballots[0];
      bookToVotes.set(firstChoice, (bookToVotes.get(firstChoice) ?? 0) + 1);
    }

    // console.log("votersToBallots", votersToBallots);
    // console.log("bookToVotes", bookToVotes);

    const possibleWinner = Array.from(bookToVotes.entries()).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    );

    // console.log("possibleWinner", possibleWinner);
    const votesNeededToWin = Math.ceil(votersToBallots.size / 2);

    // console.log("votesNeededToWin", votesNeededToWin);
    if (possibleWinner[1] >= votesNeededToWin) {
      winner = { bookId: possibleWinner[0], firstPlaces: possibleWinner[1] };
    } else {
      const leastVotedBook = Array.from(bookToVotes.entries()).reduce((a, b) =>
        a[1] < b[1] ? a : b,
      );
      const allLeastVotedBooks = Array.from(bookToVotes.entries())
        .filter((entry) => entry[1] === leastVotedBook[1])
        .map((entry) => entry[0]);
      loserBookIds.push(...bordaCount(allLeastVotedBooks, votersToBallots));
      // console.log("loserBookIds", loserBookIds);
      for (const [voter, ballots] of votersToBallots) {
        if (loserBookIds.includes(ballots[0])) {
          ballots.shift();
          if (ballots.length === 0) {
            votersToBallots.delete(voter);
          }
        }
      }
    }
    // console.log("--------------------");
  }

  return winner;
}
