import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { findClub } from "~/.server/model/clubs";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { db } from "~/.server/model/db";
import { SELECTION_ROUNDS } from "~/.server/model/tables";
import { zfd } from "zod-form-data";
import { z } from "zod";
import {
  hasRoundOnState,
  startSelectionRound,
} from "~/.server/model/selectionRounds";
import { requireAuthenticated } from "~/.server/auth/guards";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../@/components/ui/card";

const loaderSchema = z.object({
  clubId: z.string().transform((val) => parseInt(val, 10)),
});

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const { clubId } = loaderSchema.parse(args.params);

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

const roundSchema = zfd.formData({
  clubId: zfd.numeric(),
  intent: zfd.text(z.enum(["suggest", "vote"])),
});

export async function action(args: ActionFunctionArgs) {
  await requireAuthenticated(args);

  const { clubId, intent } = roundSchema.parse(await args.request.formData());

  const hasOngoingRound = await hasRoundOnState(clubId, "suggesting");

  if (hasOngoingRound) {
    throw new Response("Conflict", { status: 409 });
  }

  const invitation = await startSelectionRound(clubId);

  return json({ invitation });
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
      {invitation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">{club.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post">
              <input type="hidden" name="clubId" value={club.id} />
              {club.hasOpenSelectionRound ? (
                <div>Round already ongoing</div>
              ) : (
                <Button type="submit">Start selection round</Button>
              )}
            </Form>
            Invitation link:{" "}
            <Link
              to={`/invite/${invitation.invitationId}/${invitation.inviteToken}/`}
            >
              {invitation.inviteToken}
            </Link>
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={copyLinkToClipboard}>
              Copy link
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}
