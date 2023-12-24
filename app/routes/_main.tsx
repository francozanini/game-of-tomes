import { Button } from "@/components/ui/button";
import { Outlet } from "@remix-run/react";

export default function IndexLayout() {
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
        <div>
          <a className="text-sm font-semibold text-muted-foreground">Login</a>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
