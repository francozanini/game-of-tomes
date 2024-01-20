import { db } from "~/.server/model/db";
import { SELECTION_ROUNDS } from "~/.server/model/tables";

export function startOrMoveSelectionRound(clubId: number) {
  return db
    .insertInto(SELECTION_ROUNDS)
    .values({ clubId, state: "suggesting", inviteToken: randomString(12) })
    .returning(["id as invitationId", "inviteToken", "clubId"])
    .onConflict((cb) =>
      cb.constraint("").doUpdateSet({
        state: (eb) =>
          eb
            .case()
            .when("state", "=", "suggesting")
            .then("voting")
            .when("state", "=", "voting")
            .then("finished")
            .endCase(),
      }),
    )
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

export function activeSelectionRound(clubId: number) {
  return db
    .selectFrom(SELECTION_ROUNDS)
    .selectAll()
    .where("clubId", "=", clubId)
    .where("state", "in", ["suggesting", "voting"])
    .orderBy("createdAt", "desc")
    .executeTakeFirst();
}
