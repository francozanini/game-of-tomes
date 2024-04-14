import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { findClub } from "~/.server/model/clubs";
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Button } from "~/primitives/ui/button";
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
} from "~/primitives/ui/card";
import {
  invitationLink,
  InvitationLink,
} from "~/features/clubs/InvitationLink";
import { SelectionRoundState } from "kysely-codegen";
import { createToastHeaders } from "~/.server/primitives/toast";

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

  return json({
    club: clubAndMembership,
    currentRound: await currentRound,
  });
}

const roundSchema = zfd.formData({
  clubId: zfd.numeric(),
});

export async function action(args: ActionFunctionArgs) {
  await requireAuthenticated(args);

  const { clubId } = roundSchema.parse(await args.request.formData());

  const invitation = await startOrAdvanceSelectionRound(clubId);

  return json(
    { invitation },
    {
      headers: await createToastHeaders({
        description: "Round advanced!",
      }),
    },
  );
}

function MoveToNextRoundStepForm(props: {
  clubId: number;
  currentRoundState: SelectionRoundState | null | undefined;
}) {
  const nextStep = nextRoundStep(props.currentRoundState);

  if (nextStep === "suggesting") {
    return (
      <Form method="post">
        <input type="hidden" name="clubId" value={props.clubId} />
        <Button type="submit">Start suggestion round</Button>
      </Form>
    );
  } else if (nextStep === "voting") {
    return (
      <Form method="post">
        <input type="hidden" name="clubId" value={props.clubId} />
        <Button type="submit">Start voting</Button>
      </Form>
    );
  } else {
    return (
      <Form method="post">
        <input type="hidden" name="clubId" value={props.clubId} />
        <Button type="submit">Finish Voting</Button>
      </Form>
    );
  }
}

function CopyToClipboardButton(props: { text: string }) {
  function copyToClipboard() {
    navigator.clipboard.writeText(props.text);
  }

  return (
    <Button type="button" onClick={copyToClipboard}>
      Copy to clipboard
    </Button>
  );
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

  return (
    <main className="container mt-2 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">{club.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {invitation && <InvitationLink invitation={invitation} />}
        </CardContent>
        <CardFooter className="flex gap-2">
          <MoveToNextRoundStepForm
            clubId={club.id}
            currentRoundState={currentRound?.state}
          />
          {invitation && (
            <CopyToClipboardButton
              text={`${location.origin}${invitationLink(invitation)}`}
            />
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
