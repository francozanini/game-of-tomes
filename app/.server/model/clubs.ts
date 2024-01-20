import { db } from "~/.server/model/db";
import { expressionBuilder } from "kysely";
import { CLUBS, CLUB_MEMBERS, SELECTION_ROUNDS } from "./tables";
import { DB } from "kysely-codegen";

function withIsMember(userId: string) {
  return expressionBuilder<DB, typeof CLUBS>()
    .exists((eb) =>
      eb
        .selectFrom(CLUB_MEMBERS)
        .where("clubMember.clubId", "=", eb.ref("club.id"))
        .where("clubMember.userId", "=", userId),
    )
    .as("isMember");
}

export async function findClubsAndComputeUserMembership(userId: string) {
  return await db
    .selectFrom(CLUBS)
    .select(["club.id", "club.name", "club.description", withIsMember(userId)])
    .execute();
}

export async function findClub(clubId: number, userId: string) {
  return await db
    .selectFrom(CLUBS)
    .select((eb) => [
      "club.id",
      "club.name",
      "club.description",
      withIsMember(userId),
      eb
        .exists(
          eb
            .selectFrom(SELECTION_ROUNDS)
            .selectAll()
            .where("selectionRound.clubId", "=", clubId)
            .where((eb) =>
              eb.or([
                eb("selectionRound.state", "=", "suggesting"),
                eb("selectionRound.state", "=", "voting"),
              ]),
            ),
        )
        .as("hasOpenSelectionRound"),
    ])
    .where("club.id", "=", clubId)
    .executeTakeFirst();
}

export async function joinClub(userId: string, clubId: number) {
  return await db
    .insertInto(CLUB_MEMBERS)
    .values({
      clubId,
      userId,
    })
    .execute();
}
