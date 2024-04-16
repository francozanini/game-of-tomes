import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/primitives/ui/card";
import { Button } from "~/primitives/ui/button";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  findClubsAndComputeUserMembership,
  joinClub,
} from "~/.server/model/clubs";
import invariant from "~/utils/invariant";
import { currentUserOrRedirect } from "~/.server/auth/guards";
import { Book, fetchBook } from "~/.server/google-books/api";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await currentUserOrRedirect(args, "/clubs");

  const clubs = await findClubsAndComputeUserMembership(userId);

  const clubsWithCurrentlyReading = await Promise.all(
    clubs.map(async (club) => {
      if (!club.currentlyReadingBookId) {
        return { ...club, currentlyReading: null };
      }

      const book = await fetchBook(club.currentlyReadingBookId);
      return { ...club, currentlyReading: book };
    }),
  );

  return json({ clubs: clubsWithCurrentlyReading });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  invariant(userId, "User must be signed in to join a club");

  const formData = await args.request.formData();
  const clubIdString = formData.get("clubId");
  invariant(clubIdString, "Club ID must be provided");
  const clubId = parseInt(clubIdString as string, 10);

  console.log(userId);

  await joinClub(userId, clubId);

  return json({ message: "Joined club" });
}

function CurrentlyReading(props: { book: Book | null }) {
  if (!props.book) {
    return null;
  }

  return (
    <div className="grid max-h-[300px] grid-cols-12 gap-4">
      <div className="col-span-2 flex flex-col items-center gap-2">
        <img
          src={props.book.volumeInfo.imageLinks?.thumbnail}
          alt={props.book.volumeInfo.title}
          className="object-fit h-[300px] w-[200px] rounded-lg"
        />
      </div>
      <div className="col-span-10 flex max-h-[300px] flex-col overflow-y-auto">
        <div>
          <p className="font-semibold">{props.book.volumeInfo.title}</p>
          <p className="text-sm text-gray-500">
            {props.book.volumeInfo.authors}
          </p>
        </div>
        <HtmlText text={props.book.volumeInfo.description} />
      </div>
    </div>
  );
}

function HtmlText(props: { text: string }) {
  return (
    <div className="space-y-2">
      <div
        className="flex flex-col gap-2 text-sm text-gray-500"
        dangerouslySetInnerHTML={{
          __html: props.text,
        }}
      ></div>
    </div>
  );
}

export default function Clubs() {
  const { clubs } = useLoaderData<typeof loader>();
  return (
    <main className="container mt-2 max-w-[1250px]">
      {clubs.map((club) => (
        <Card key={club.id}>
          <CardHeader>
            <CardTitle>{club.name}</CardTitle>
            <CardDescription>{club.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentlyReading book={club.currentlyReading} />
          </CardContent>
          <CardFooter>
            <Form method="post">
              <input type="hidden" name="clubId" value={club.id} />
              {!club.isMember && <Button type="submit">Join</Button>}
            </Form>
            {club.isMember && (
              <Button variant="link">
                <Link to={`/clubs/${club.id}/manage`}>Manage</Link>
              </Button>
            )}
            {club.currentlyReading && (
              <Button variant="link">
                <a href={club.currentlyReading.volumeInfo.previewLink}>
                  Preview
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </main>
  );
}
