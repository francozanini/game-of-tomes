import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireAuthenticated } from "~/.server/auth/guards";
import { findClub } from "~/.server/model/clubs";
import { findSelectionRound } from "~/.server/model/selectionRounds";
import invariant from "~/utils/invariant";
import { Book, fetchBooksByIds } from "~/.server/google-books/api";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../@/components/ui/avatar";
import { Button } from "../../@/components/ui/button";
import { useDrag, useDrop } from "react-dnd";
import { useRef, useState } from "react";
import { XYCoord, Identifier } from "dnd-core";
import { useAutoAnimate } from "@formkit/auto-animate/react";

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

interface DragBook {
  index: number;
  dragId: number;
}

function VotingCard({
  book,
  index,
  reorderVotes,
}: {
  book: Book & { dragId: number };
  index: number;
  reorderVotes: Function;
}) {
  const { volumeInfo } = book;
  const ref = useRef<HTMLDivElement>();

  const bookItem = "bookItem";

  const [{ handlerId }, drop] = useDrop<
    DragBook,
    void,
    { handlerId: Identifier | null }
  >({
    accept: bookItem,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragBook, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      reorderVotes(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ opacity }, drag] = useDrag(() => ({
    type: bookItem,
    item: () => ({ index, dragId: book.dragId }),
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  }));

  drag(drop(ref));

  return (
    <Card
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity }}
      className="hover:border-red-900"
    >
      <CardContent className="flex flex-row items-center justify-between p-4">
        <div className="flex flex-row items-center space-x-2">
          <Avatar>
            <AvatarImage
              className="object-fit"
              src={
                volumeInfo.imageLinks?.smallThumbnail ||
                volumeInfo.imageLinks?.thumbnail ||
                volumeInfo.imageLinks?.small ||
                volumeInfo.imageLinks?.medium ||
                volumeInfo.imageLinks?.large ||
                volumeInfo.imageLinks?.extraLarge
              }
            />
            <AvatarFallback>Cover</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-bold">{volumeInfo.title}</h3>
            <h4 className="text-sm">{volumeInfo.authors?.join(", ")}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Voting() {
  const { club, currentRound, suggestedBooksSoFar } =
    useLoaderData<typeof loader>();
  const [booksInVotingOrder, setBooksInVotingOrder] = useState(
    suggestedBooksSoFar.map((b, index) => ({ ...b, dragId: index })),
  );

  const reorderVotes = (dragIndex: number, hoverIndex: number) => {
    const dragBook = booksInVotingOrder[dragIndex];
    const newBooks = [...booksInVotingOrder];
    newBooks.splice(dragIndex, 1);
    newBooks.splice(hoverIndex, 0, dragBook);
    setBooksInVotingOrder(newBooks);
  };

  const [animateRef] = useAutoAnimate();

  return (
    <div className="container mt-4 space-y-4">
      <h1 className="text-center text-4xl font-bold">Make your vote</h1>
      <h2 className="text-center">Choose {club.name}'s next book</h2>
      <div className="flex flex-row justify-center space-y-4">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <h2 className="text-xl font-bold">Suggested books</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4" ref={animateRef}>
            {booksInVotingOrder.map((book, index) => (
              <VotingCard
                key={book.id}
                book={book}
                index={index}
                reorderVotes={reorderVotes}
              />
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-semibold uppercase">
              Submit
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
