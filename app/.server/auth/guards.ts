import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { invariant } from "@remix-run/router/history";
import { getAuth } from "@clerk/remix/ssr.server";

export async function requireAuthenticated(
  args: ActionFunctionArgs | LoaderFunctionArgs,
) {
  const auth = await getAuth(args, { secretKey: process.env.CLERK_SECRET_KEY });
  invariant(auth.userId, "User must be signed in to start voting round");
  return auth;
}

export async function currentUserOrRedirect(
  args: LoaderFunctionArgs,
  redirectPath?: string | null | undefined,
) {
  if (!redirectPath) {
    redirectPath = new URL(args.request.url).pathname;
    console.log("redirectPath", redirectPath);
  }
  const fullRedirect = `/signin?redirect=${redirectPath}`;

  try {
    const auth = await getAuth(args, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    if (!auth.userId) {
      console.log(
        "redirecting to",
        fullRedirect,
        "because user is not signed in",
        args,
      );
      throw redirect(fullRedirect);
    }
    return auth;
  } catch (e) {
    throw redirect(fullRedirect);
  }
}
