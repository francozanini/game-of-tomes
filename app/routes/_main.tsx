import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth,
  useUser,
} from "@clerk/remix";
import { Link, Outlet } from "@remix-run/react";

export default function IndexLayout() {
  const { isSignedIn } = useUser();

  return (
    <>
      <nav className="container flex flex-row justify-between border-b border-border/40 p-4 px-8">
        <div className="flex flex-row gap-4">
          <h1 className="font-bold">game.of.tomes</h1>
          <div className="flex flex-row items-center">
            <a
              href="/clubs"
              className="text-sm font-semibold text-muted-foreground"
            >
              Clubs
            </a>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          {/* <Link
            to="/signin"
            className="text-sm font-semibold text-muted-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold text-muted-foreground"
          >
            Sign up
          </Link> */}
          {isSignedIn ? <SignOutButton /> : <SignInButton mode="modal" />}
        </div>
      </nav>
      <Outlet />
    </>
  );
}
