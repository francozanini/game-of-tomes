import { db } from "~/.server/model/db";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuth } from "@clerk/remix/ssr.server";
import { findClubsAndComputeUserMembership } from "~/.server/model/clubs";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  invariant(userId, "User must be signed in to join a club");

  const clubs = await findClubsAndComputeUserMembership(userId);

  return json({ clubs });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  invariant(userId, "User must be signed in to join a club");

  const formData = await args.request.formData();
  const clubIdString = formData.get("clubId");
  invariant(clubIdString, "Club ID must be provided");
  const clubId = parseInt(clubIdString as string, 10);

  await db.insertInto("clubMembers").values({ clubId, userId }).execute();

  return json({ message: "Joined club" });
}

export default function Clubs() {
  const { clubs } = useLoaderData<typeof loader>();
  return (
    <main className="container">
      <div className="mt-2">
        {clubs.map((club) => (
          <Card key={club.id}>
            <CardHeader>
              <CardTitle>{club.name}</CardTitle>
              <CardDescription>{club.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Form method="post" action="/clubs">
                <input type="hidden" name="clubId" value={club.id} />
                {!club.isMember && <Button type="submit">Join</Button>}
              </Form>
              {club.isMember && (
                <Button>
                  <Link to={`/clubs/${club.id}`}>Details</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
function invariant(val: unknown, message: string): asserts val {
  if (val === null) {
    throw new Error(message);
  }
}