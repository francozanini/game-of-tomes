import { expect, test } from "vitest";
import { solveRankedVoting } from "~/.server/model/votes";
import { Vote } from "kysely-codegen";

const clubId = 5;
const votingRound = 1;

test("no votes", () => {
  expect(solveRankedVoting([])).toEqual(null);
});

test("only one vote", () => {
  const votes: Array<Vote> = [
    { bookId: "1", userId: "1", rank: 1, clubId, votingRound },
  ];
  expect(solveRankedVoting(votes)).toEqual({
    bookId: votes[0].bookId,
    firstPlaces: 1,
  });
});

test("everyone votes the same book", () => {
  const votes: Array<Vote> = [
    { bookId: "1", userId: "1", rank: 1, clubId, votingRound },
    { bookId: "1", userId: "2", rank: 1, clubId, votingRound },
    { bookId: "1", userId: "3", rank: 1, clubId, votingRound },
  ];
  expect(solveRankedVoting(votes)).toEqual({
    bookId: "1",
    firstPlaces: 3,
  });
});

test("book with majority wins on first round", () => {
  const votes: Array<Vote> = [
    { bookId: "1", userId: "1", rank: 1, clubId, votingRound },
    { bookId: "2", userId: "2", rank: 1, clubId, votingRound },
    { bookId: "2", userId: "3", rank: 1, clubId, votingRound },
    { bookId: "3", userId: "4", rank: 1, clubId, votingRound },
    { bookId: "3", userId: "5", rank: 1, clubId, votingRound },
    { bookId: "3", userId: "6", rank: 1, clubId, votingRound },
    { bookId: "3", userId: "7", rank: 1, clubId, votingRound },
  ];
  expect(solveRankedVoting(votes)).toEqual({
    bookId: "3",
    firstPlaces: 4,
  });
});

test("not strong majority in first round, win on following rounds", () => {
  const votes: Array<Vote> = [
    { bookId: "1", userId: "1", rank: 1, clubId, votingRound },
    { bookId: "1", userId: "2", rank: 1, clubId, votingRound },
    { bookId: "2", userId: "3", rank: 1, clubId, votingRound },
    { bookId: "20", userId: "3", rank: 2, clubId, votingRound },
    { bookId: "3", userId: "4", rank: 1, clubId, votingRound },
    { bookId: "30", userId: "4", rank: 2, clubId, votingRound },
    { bookId: "4", userId: "5", rank: 1, clubId, votingRound },
    { bookId: "40", userId: "5", rank: 2, clubId, votingRound },
    { bookId: "5", userId: "6", rank: 1, clubId, votingRound },
    { bookId: "50", userId: "6", rank: 2, clubId, votingRound },
  ];
  expect(solveRankedVoting(votes)).toEqual({
    bookId: "1",
    firstPlaces: 2,
  });
});

test("not strong majority in first round, overtaken on second round", () => {
  const votes: Array<Vote> = [
    { bookId: "1", userId: "1", rank: 1, clubId, votingRound },
    { bookId: "69", userId: "1", rank: 2, clubId, votingRound },

    { bookId: "1", userId: "2", rank: 1, clubId, votingRound },
    { bookId: "79", userId: "2", rank: 2, clubId, votingRound },

    { bookId: "2", userId: "3", rank: 1, clubId, votingRound },
    { bookId: "88", userId: "3", rank: 2, clubId, votingRound },

    { bookId: "3", userId: "4", rank: 1, clubId, votingRound },
    { bookId: "2", userId: "4", rank: 2, clubId, votingRound },

    { bookId: "5", userId: "6", rank: 1, clubId, votingRound },
    { bookId: "2", userId: "6", rank: 2, clubId, votingRound },
  ];
  expect(solveRankedVoting(votes)).toEqual({
    bookId: "2",
    firstPlaces: 3,
  });
});

test("three way tie first round, eventual winner after borda count", () => {
  const votes: Array<Vote> = [
    { bookId: "1", userId: "1", rank: 1, clubId, votingRound },
    { bookId: "2", userId: "1", rank: 2, clubId, votingRound },
    { bookId: "69", userId: "1", rank: 3, clubId, votingRound },

    { bookId: "2", userId: "2", rank: 1, clubId, votingRound },
    { bookId: "6969", userId: "2", rank: 2, clubId, votingRound },
    { bookId: "1", userId: "2", rank: 3, clubId, votingRound },

    { bookId: "3", userId: "3", rank: 1, clubId, votingRound },
    { bookId: "1", userId: "3", rank: 2, clubId, votingRound },
    { bookId: "420", userId: "3", rank: 3, clubId, votingRound },
  ];
  expect(solveRankedVoting(votes)).toEqual({
    bookId: "1",
    firstPlaces: 2,
  });
});
