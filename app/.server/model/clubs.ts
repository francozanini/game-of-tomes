import { db } from "~/.server/model/db";
import { expressionBuilder } from "kysely";
import { Database } from "~/.server/model/tables/schema";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { CLUBS, SELECTION_ROUNDS } from "./tables";

function withIsMember(userId: string) {
  const eb = expressionBuilder<Database, "clubs">();
  return eb
    .exists(
      eb
        .selectFrom("clubMembers")
        .where("clubMembers.clubId", "=", eb.ref("clubs.id"))
        .where("clubMembers.userId", "=", userId),
    )
    .as("isMember");
}

export async function findClubsAndComputeUserMembership(userId: string) {
  return await db
    .selectFrom(CLUBS)
    .select([
      "clubs.id",
      "clubs.name",
      "clubs.description",
      withIsMember(userId),
    ])
    .execute();
}

export async function findClub(userId: string, clubId: number) {
  return await db
    .selectFrom(CLUBS)
    .select((eb) => [
      "clubs.id",
      "clubs.name",
      "clubs.description",
      withIsMember(userId),
      eb
        .exists(
          eb
            .selectFrom(SELECTION_ROUNDS)
            .selectAll()
            .where("selectionRounds.clubId", "=", clubId)
            .where((eb) =>
              eb.or([
                eb("selectionRounds.state", "=", "suggesting"),
                eb("selectionRounds.state", "=", "voting"),
              ]),
            ),
        )
        .as("hasOpenSelectionRound"),
    ])
    .where("clubs.id", "=", clubId)
    .executeTakeFirst();
}
