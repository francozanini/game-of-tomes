import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { invariant } from "@remix-run/router/history";
import { getAuth } from "@clerk/remix/ssr.server";
import { findClub } from "~/.server/model/clubs";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { db } from "~/.server/model/db";
import { SELECTION_ROUNDS } from "~/.server/model/tables";

export async function loader(args: LoaderFunctionArgs) {
  const clubIdString = args.params.clubId;
  invariant(clubIdString, "Club ID must be provided");
  const clubId = parseInt(clubIdString as string, 10);

  const { userId } = await getAuth(args);
  invariant(userId, "User must be signed in to join a club");

  const currentRound = db
    .selectFrom(SELECTION_ROUNDS)
    .selectAll()
    .where("clubId", "=", clubId)
    .where("state", "=", "suggesting")
    .orderBy("createdAt", "desc")
    .limit(1)
    .executeTakeFirst();

  const clubAndMembership = await findClub(userId, clubId);

  if (!clubAndMembership || !clubAndMembership.isMember) {
    throw new Response("Not found", { status: 404 });
  }

  return json({ club: clubAndMembership, currentRound: await currentRound });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  invariant(userId, "User must be signed in to start voting round");

  const formData = await args.request.formData();
  const clubIdString = formData.get("clubId");
  invariant(clubIdString, "Club ID must be provided");
  const clubId = parseInt(clubIdString as string, 10);

  const hasOngoingRound = await db
    .selectFrom(SELECTION_ROUNDS)
    .where("clubId", "=", clubId)
    .where("state", "=", "suggesting")
    .executeTakeFirst();

  if (hasOngoingRound) {
    throw new Response("Conflict", { status: 409 });
  }

  const invitation = await db
    .insertInto(SELECTION_ROUNDS)
    .values({ clubId, state: "suggesting", inviteToken: randomString(12) })
    .returning(["id as invitationId", "inviteToken", "clubId"])
    .executeTakeFirstOrThrow();

  return json({ invitation });
}

function randomString(length: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function Club() {
  const { club, currentRound } = useLoaderData<typeof loader>();
  const invitation =
    useActionData<typeof action>()?.invitation ||
    (currentRound && {
      clubId: club.id,
      inviteToken: currentRound?.inviteToken,
      invitationId: currentRound?.id,
    });

  const copyLinkToClipboard = () =>
    navigator.clipboard.writeText(
      `${location.origin}/invite/${invitation?.invitationId}/${invitation?.inviteToken}/`,
    );

  return (
    <main className="container">
      <h1 className="text-lg font-bold">{club.name}</h1>
      <p>{club.description}</p>
      <Form method="post">
        <input type="hidden" name="clubId" value={club.id} />
        {club.hasOpenSelectionRound ? (
          <div>Round already ongoing</div>
        ) : (
          <Button type="submit">Start voting round</Button>
        )}
      </Form>
      {invitation && (
        <div>
          <p>
            Invitation link:{" "}
            <a
              href={`/invite/${invitation.invitationId}/${invitation.inviteToken}/`}
            >
              {invitation.inviteToken}
            </a>
          </p>
          <Button type="button" variant="ghost" onClick={copyLinkToClipboard}>
            Copy link
          </Button>
        </div>
      )}
    </main>
  );
}
