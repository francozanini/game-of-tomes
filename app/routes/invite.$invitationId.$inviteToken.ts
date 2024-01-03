import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { joinClub } from "~/.server/model/clubs";
import { db } from "~/.server/model/db";
import { CLUBS, CLUB_MEMBERS, SELECTION_ROUNDS } from "~/.server/model/tables";
import invariant from "~/utils/invariant";

export async function loader(args: LoaderFunctionArgs) {
  const { invitationIdRaw, inviteToken } = args.params;
  invariant(invitationIdRaw, "invitationId is required");
  invariant(inviteToken, "inviteToken is required");
  const invitationId = parseInt(invitationIdRaw, 10);

  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect(`/sign-in?redirect=/invite/${invitationId}/${inviteToken}`);
  }

  const round = await db
    .selectFrom(SELECTION_ROUNDS)
    .select((eb) => [
      "state",
      "clubId",
      eb
        .exists(
          eb
            .selectFrom(CLUB_MEMBERS)
            .whereRef("clubId", "=", "clubMembers.clubId")
            .where("userId", "=", userId!)
            .select(["clubMembers.userId"]),
        )
        .as("userIsMember"),
    ])
    .leftJoin(CLUBS, "clubs.id", "clubId")
    .where((eb) =>
      eb.and([
        eb("id", "=", invitationId),
        eb("inviteToken", "=", inviteToken),
      ]),
    )
    .executeTakeFirst();

  if (!round) {
    return redirect("/404");
  }

  if (round.state === "closed") {
    throw new Error("Round is closed");
  }

  if (!round.userIsMember) {
    await joinClub(userId, round.clubId);
  }

  if (round.state === "suggesting") {
    return redirect(`/clubs/${round.clubId}/suggestions`);
  } else if (round.state === "voting") {
    return redirect(`/clubs/${round.clubId}/vote`);
  } else {
    throw new Error("Unknown state");
  }
}
