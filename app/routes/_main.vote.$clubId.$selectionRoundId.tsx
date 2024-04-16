import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { requireAuthenticated } from "~/.server/auth/guards";
import { findClub } from "~/.server/model/clubs";
import { findSelectionRound } from "~/.server/model/selectionRounds";
import invariant from "~/utils/invariant";
import { fetchBooksByIds } from "~/.server/google-books/api";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/primitives/ui/card";
import { Button } from "~/primitives/ui/button";
import { useState } from "react";
import { Reorder } from "framer-motion";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { findVotes, registerOrChangeVotes } from "~/.server/model/votes";
import { createToastHeaders } from "~/.server/primitives/toast";
import { VotingCard } from "../features/books/vote/VotingCard";

async function validateClubMembershipAndVotableRound(
  args: ActionFunctionArgs,
  userId: string,
) {
  const { clubId, selectionRoundId } = args.params;
  invariant(clubId, "clubId is required");
  invariant(selectionRoundId, "selectionRoundId is required");
  const currentRoundPromise = findSelectionRound(+selectionRoundId);
  const club = await findClub(+clubId, userId);
  const currentRound = await currentRoundPromise;

  invariant(club, "Club not found");
  invariant(currentRound, "Round not found");

  if (!club.isMember) {
    throw redirect(`/clubs/${clubId}/join`);
  }

  if (currentRound.clubId !== +clubId) {
    throw new Error("Round not part of club");
  }

  if (currentRound.state !== "voting") {
    throw new Error("Not time to vote yet");
  }

  return { club, currentRound };
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const { club, currentRound } = await validateClubMembershipAndVotableRound(
    args,
    userId,
  );

  let currentVotes = (await findVotes(userId, currentRound.id)).map(
    (b) => b.bookId,
  );

  currentVotes =
    currentVotes.length > 0
      ? currentVotes
      : currentRound.booksSuggested.map((b) => b.bookId);

  const votingOptions = await fetchBooksByIds(currentVotes).then((books) =>
    books.map((book) => {
      const suggestion = currentRound.booksSuggested.find(
        (s) => s.bookId === book.id,
      )!;

      return { ...book, ...suggestion };
    }),
  );

  return json({ votingOptions, club, currentRound });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const validationResult = await votesValidator.validate(
    await args.request.formData(),
  );

  if (validationResult.error) {
    console.error(validationResult.error);
    throw new Error("Invalid form data");
  }

  const { club, currentRound } = await validateClubMembershipAndVotableRound(
    args,
    userId,
  );

  const votes = Array.from(
    new Set(validationResult.data.votes.map((vote) => vote.bookId)),
  );

  const persistedVotes = await registerOrChangeVotes(
    votes,
    currentRound.id,
    club.id,
    userId,
  );

  if (persistedVotes.length !== votes.length) {
    return json(
      { message: "Your votes could not be saved" },
      {
        headers: await createToastHeaders({
          description: "Error updating votes",
          type: "error",
        }),
        status: 400,
      },
    );
  }

  return json(
    { message: "Your votes have been saved" },
    {
      headers: await createToastHeaders({
        description: "Votes updated successfully",
        type: "success",
      }),
    },
  );
}

const votesValidator = withZod(
  z.object({
    votes: z.array(z.object({ bookId: z.string() })),
  }),
);

export default function Voting() {
  const { club, currentRound, votingOptions } = useLoaderData<typeof loader>();
  const [booksInVotingOrder, setBooksInVotingOrder] = useState(votingOptions);
  const { state: navigationState } = useNavigation();
  const isSubmitting = navigationState === "submitting";

  return (
    <div className="container mt-4 space-y-4">
      <h1 className="text-center text-4xl font-bold">Make your vote</h1>
      <h2 className="text-center">Choose {club.name}&apos;s next book</h2>
      <div className="flex flex-row justify-center space-y-4">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <h2 className="text-xl font-bold">Suggested books</h2>
          </CardHeader>
          <CardContent>
            <Reorder.Group
              className="flex flex-col gap-2"
              onReorder={setBooksInVotingOrder}
              values={booksInVotingOrder}
            >
              {booksInVotingOrder.map((book, index) => (
                <Reorder.Item value={book} key={book.id}>
                  <VotingCard key={book.id} book={book} rank={index + 1} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </CardContent>
          <CardFooter>
            <Form className="w-full" method="post">
              <input
                type="hidden"
                name="selectionRoundId"
                value={currentRound.id}
              />
              {booksInVotingOrder.map((book, index) => (
                <input
                  key={book.id}
                  type="hidden"
                  name={`votes[${index}].bookId`}
                  value={book.id}
                />
              ))}
              <Button
                type="submit"
                className="w-full font-semibold uppercase"
                disabled={isSubmitting}
              >
                Submit
              </Button>
            </Form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
