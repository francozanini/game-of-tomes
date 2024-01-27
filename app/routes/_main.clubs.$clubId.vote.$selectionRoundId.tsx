import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireAuthenticated } from "./../.server/auth/guards";
import { findClub } from "./../.server/model/clubs";
import { findSelectionRound } from "~/.server/model/selectionRounds";
import invariant from "~/utils/invariant";
import { fetchBooksByIds } from "~/.server/google-books/api";
import { useLoaderData } from "@remix-run/react";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await requireAuthenticated(args);
  const { clubId, selectionRoundId } = args.params;
  invariant(clubId, "clubId is required");
  invariant(selectionRoundId, "selectionRoundId is required");

  const currentRoundPromise = findSelectionRound(+selectionRoundId);
  const club = await findClub(+clubId, userId);
  const currentRound = await currentRoundPromise;

  invariant(club, "Club not found");
  invariant(currentRound, "Round not found");

  if (!club.isMember) {
    return redirect(`/clubs/${clubId}/join`);
  }

  if (currentRound.clubId !== +clubId) {
    throw new Error("Round not part of club");
  }

  if (currentRound.state !== "voting") {
    throw new Error("Not time to vote yet");
  }

  const suggestedBooksSoFar = await fetchBooksByIds(
    currentRound.booksSuggested.map((b) => b.bookId),
  ).then((books) =>
    books.map((book) => {
      const suggestion = currentRound.booksSuggested.find(
        (s) => s.bookId === book.id,
      )!;

      return { ...book, ...suggestion };
    }),
  );

  return json({ suggestedBooksSoFar, club, currentRound });
}

export default function Voting() {
  const data = useLoaderData<typeof loader>();
  const { club, currentRound, suggestedBooksSoFar } = data;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Vote</h1>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Suggested books</h2>

        <div className="space-y-4">
          {suggestedBooksSoFar.map((book) => (
            <div key={book.id}>
              <div className="flex items-center space-x-4">
                <img
                  src={book.volumeInfo.imageLinks?.thumbnail}
                  alt=""
                  className="h-16 w-16 rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-bold">
                      {book.volumeInfo.title}
                    </h3>
                    <span className="text-gray-500">by</span>
                    <h4 className="text-xl font-bold">
                      {book.volumeInfo.authors}
                    </h4>
                  </div>
                  <p className="text-gray-500">
                    {book.volumeInfo?.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Vote</h2>

        <div className="space-y-4">
          {suggestedBooksSoFar.map((book) => (
            <div key={book.id}>
              <div className="flex items-center space-x-4">
                <img
                  src={book.volumeInfo.imageLinks?.thumbnail}
                  alt=""
                  className="h-16 w-16 rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-bold">
                      {book.volumeInfo.title}
                    </h3>
                    <span className="text-gray-500">by</span>
                    <h4 className="text-xl font-bold">
                      {book.volumeInfo.authors}
                    </h4>
                  </div>
                  <p className="text-gray-500">{book.volumeInfo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
