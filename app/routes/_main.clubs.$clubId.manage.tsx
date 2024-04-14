import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { findClub } from "~/.server/model/clubs";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Button } from "~/primitives/ui/button";
import { zfd } from "zod-form-data";
import { z } from "zod";
import {
  activeSelectionRound,
  allRounds,
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

import { fetchBook } from "~/.server/google-books/api";
import { solveRankedVoting } from "~/.server/model/votes";

const loaderSchema = z.object({
  clubId: z.string().transform((val) => parseInt(val, 10)),
});

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const { clubId } = loaderSchema.parse(args.params);

  const currentRound = activeSelectionRound(clubId);
  const allRoundsPromise = allRounds(clubId).then(async (rounds) => {
    const roundsWithWinners = [];
    for (const round of rounds) {
      if (round.state === "finished") {
        const winner = solveRankedVoting(round.votes);
        if (winner) {
          const book = await fetchBook(winner.bookId);
          roundsWithWinners.push({
            ...round,
            winnerName: book.volumeInfo.title,
          });
        } else {
          roundsWithWinners.push({ ...round, winnerName: "-" });
        }
      } else {
        roundsWithWinners.push({ ...round, winnerName: "-" });
      }
    }

    return roundsWithWinners;
  });

  const clubAndMembership = await findClub(clubId, userId);

  if (!clubAndMembership || !clubAndMembership.isMember) {
    throw new Response("Not found", { status: 404 });
  }

  return json({
    club: clubAndMembership,
    currentRound: await currentRound,
    allRounds: await allRoundsPromise,
  });
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
  const { club, currentRound, allRounds } = useLoaderData<typeof loader>();
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
        `${location.origin}${invitationLink(invitation)}`,
      );
    }
  }

  const nextStep = nextRoundStep(currentRound?.state);

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
          <Form method="post">
            <input type="hidden" name="clubId" value={club.id} />
            <Button type="submit">
              {nextStep === "suggesting"
                ? "Start suggestion round"
                : nextStep === "voting"
                  ? "Start voting"
                  : "Finish Voting"}
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
      {/*<div className="space-y-2">*/}
      {/*  <h2 className="text-center text-2xl font-bold">Previous rounds</h2>*/}
      {/*  <div className="rounded-md border">*/}
      {/*    <Table>*/}
      {/*      <TableHeader>*/}
      {/*        <TableRow>*/}
      {/*          <TableHead>Id</TableHead>*/}
      {/*          <TableHead>State</TableHead>*/}
      {/*          <TableHead>Created at</TableHead>*/}
      {/*          <TableHead>Winner</TableHead>*/}
      {/*        </TableRow>*/}
      {/*      </TableHeader>*/}
      {/*      <TableBody>*/}
      {/*        {allRounds.length ? (*/}
      {/*          allRounds.map((row) => (*/}
      {/*            <TableRow key={row.id}>*/}
      {/*              <TableCell>{row.id}</TableCell>*/}
      {/*              <TableCell className="uppercase">{row.state}</TableCell>*/}
      {/*              <TableCell>{row.createdAt}</TableCell>*/}
      {/*              <TableCell>{row.winnerName}</TableCell>*/}
      {/*            </TableRow>*/}
      {/*          ))*/}
      {/*        ) : (*/}
      {/*          <TableRow>*/}
      {/*            <TableCell colSpan={3} className="h-24 text-center">*/}
      {/*              No results.*/}
      {/*            </TableCell>*/}
      {/*          </TableRow>*/}
      {/*        )}*/}
      {/*      </TableBody>*/}
      {/*    </Table>*/}
      {/*  </div>*/}
      {/*</div>*/}
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
