import { db } from "~/.server/model/db";
import { SELECTION_ROUNDS } from "~/.server/model/tables";

export function startSelectionRound(clubId: number) {
  return db
    .insertInto(SELECTION_ROUNDS)
    .values({ clubId, state: "suggesting", inviteToken: randomString(12) })
    .returning(["id as invitationId", "inviteToken", "clubId"])
    .executeTakeFirstOrThrow();
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
