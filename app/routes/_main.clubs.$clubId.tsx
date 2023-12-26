import { LoaderFunctionArgs, json } from "@remix-run/node";
import { invariant } from "@remix-run/router/history";
import { getAuth } from "@clerk/remix/ssr.server";
import { findClubAndUserMembership } from "~/.server/model/clubs";
import { useLoaderData } from "@remix-run/react";

export async function loader(args: LoaderFunctionArgs) {
  const clubIdString = args.params.clubId;
  invariant(clubIdString, "Club ID must be provided");
  const clubId = parseInt(clubIdString as string, 10);

  const { userId } = await getAuth(args);
  invariant(userId, "User must be signed in to join a club");

  const clubAndMembership = await findClubAndUserMembership(userId, clubId);

  if (!clubAndMembership?.length || !clubAndMembership[0]?.isMember) {
    throw new Response("Not found", { status: 404 });
  }

  const club = clubAndMembership[0];

  return json({ club });
}

export default function Club() {
  const { club } = useLoaderData<typeof loader>();

  return (
    <main className="container">
      <h1>{club.name}</h1>
      <p>{club.description}</p>
    </main>
  );
}
