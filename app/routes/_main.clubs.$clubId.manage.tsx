import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { findClub } from "~/.server/model/clubs";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { zfd } from "zod-form-data";
import { z } from "zod";
import {
  activeSelectionRound,
  startOrAdvanceSelectionRound,
} from "~/.server/model/selectionRounds";
import { requireAuthenticated } from "~/.server/auth/guards";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../@/components/ui/card";
import { invitationLink, InvitationLink } from "~/components/InvitationLink";
import { DB, SelectionRound, SelectionRoundState } from "kysely-codegen";

const loaderSchema = z.object({
  clubId: z.string().transform((val) => parseInt(val, 10)),
});

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const { clubId } = loaderSchema.parse(args.params);

  const currentRound = activeSelectionRound(clubId);

  const clubAndMembership = await findClub(clubId, userId);

  if (!clubAndMembership || !clubAndMembership.isMember) {
    throw new Response("Not found", { status: 404 });
  }

  return json({ club: clubAndMembership, currentRound: await currentRound });
}

const roundSchema = zfd.formData({
  clubId: zfd.numeric(),
});

export async function action(args: ActionFunctionArgs) {
  await requireAuthenticated(args);

  const { clubId } = roundSchema.parse(await args.request.formData());

  const invitation = await startOrAdvanceSelectionRound(clubId);

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

  function copyLinkToClipboard() {
    if (invitation) {
      navigator.clipboard.writeText(
        `${location.origin}/${invitationLink(invitation)}`,
      );
    }
  }

  const nextStep = nextRoundStep(currentRound?.state);

  return (
    <main className="container mt-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">{club.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {invitation && <InvitationLink invitation={invitation} />}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Form method="post">
            <input type="hidden" name="clubId" value={club.id} />
            <Button type="submit">
              {nextStep === "suggesting"
                ? "Start suggestion round"
                : nextStep === "voting"
                  ? "Start voting"
                  : "Start round"}
            </Button>
          </Form>

          {invitation && (
            <Button
              type="button"
              variant="secondary"
              onClick={copyLinkToClipboard}
            >
              Copy link
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}

function nextRoundStep(
  currentStep: SelectionRoundState | null | undefined,
): SelectionRoundState {
  if (currentStep === null || currentStep === undefined) {
    return "suggesting";
  } else if (currentStep === "suggesting") {
    return "voting";
  } else {
    return "finished";
  }
}
