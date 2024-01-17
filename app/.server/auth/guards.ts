import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { invariant } from "@remix-run/router/history";
import { getAuth } from "@clerk/remix/ssr.server";

export async function requireAuthenticated(
  args: ActionFunctionArgs | LoaderFunctionArgs,
) {
  const auth = await getAuth(args);
  invariant(auth.userId, "User must be signed in to start voting round");
  return auth;
}
