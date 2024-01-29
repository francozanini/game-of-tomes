import { db } from "~/.server/model/db";
import {
  BOOK_SUGGESTIONS,
  SELECTION_ROUNDS,
  VOTES,
} from "~/.server/model/tables";
import { Transaction } from "kysely";
import { DB } from "kysely-codegen";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export async function startOrAdvanceSelectionRound(clubId: number) {
  return db.transaction().execute(async (trx) => {
    const activeRound = await activeSelectionRound(clubId, trx);

    const invitationSelections = [
      "id as invitationId",
      "inviteToken",
      "clubId",
    ] as const;

    if (!activeRound) {
      return await trx
        .insertInto(SELECTION_ROUNDS)
        .values({ clubId, state: "suggesting", inviteToken: randomString(12) })
        .returning(invitationSelections)
        .executeTakeFirstOrThrow();
    }

    const nextState =
      activeRound?.state === "suggesting" ? "voting" : "finished";

    return trx
      .updateTable(SELECTION_ROUNDS)
      .set({ state: nextState })
      .where("id", "=", activeRound.id)
      .returning(invitationSelections)
      .executeTakeFirstOrThrow();
  });
}

export async function findSelectionRound(selectionRoundId: number) {
  return db
    .selectFrom(SELECTION_ROUNDS)
    .select((eb) => [
      "id",
      "clubId",
      "state",
      jsonArrayFrom(
        eb
          .selectFrom(BOOK_SUGGESTIONS)
          .select([
            "bookSuggestion.bookId",
            "bookSuggestion.userId",
            "bookSuggestion.addedAt",
          ])
          .where("selectionRoundId", "=", eb.ref("selectionRound.id"))
          .orderBy("addedAt", "desc"),
      ).as("booksSuggested"),
    ])
    .where("id", "=", selectionRoundId)
    .executeTakeFirst();
}

function randomString(length: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function hasRoundOnState(
  clubId: number,
  state: "suggesting" | "voting",
) {
  return db
    .selectFrom(SELECTION_ROUNDS)
    .select("id")
    .where("clubId", "=", clubId)
    .where("state", "=", state)
    .executeTakeFirst();
}

export function activeSelectionRound(clubId: number, trx?: Transaction<DB>) {
  return (trx ? trx : db)
    .selectFrom(SELECTION_ROUNDS)
    .selectAll()
    .where("clubId", "=", clubId)
    .where("state", "in", ["suggesting", "voting"])
    .orderBy("createdAt", "desc")
    .executeTakeFirst();
}

export function allRounds(clubId: number) {
  return db
    .selectFrom(SELECTION_ROUNDS)
    .select((eb) => [
      "id",
      "state",
      "createdAt",
      "selectedBookId",
      jsonArrayFrom(
        eb
          .selectFrom(VOTES)
          .selectAll()
          .whereRef("vote.votingRound", "=", "selectionRound.id"),
      ).as("votes"),
    ])
    .where("clubId", "=", clubId)
    .orderBy("createdAt", "desc")
    .execute();
}
