import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton, SignOutButton, useUser } from "@clerk/remix";
import { Outlet } from "@remix-run/react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Theme, useTheme } from "~/theme";

export default function IndexLayout() {
  const { isSignedIn } = useUser();

  return (
    <>
      <header className="border-b border-border/40">
        <div className="container flex max-w-screen-2xl flex-row items-center justify-between">
          <div className="flex h-14 flex-row items-center gap-4">
            <h1 className="font-bold">game.of.tomes</h1>
            <a
              href="/clubs"
              className="text-sm font-semibold text-muted-foreground"
            >
              Clubs
            </a>
          </div>
          <div className="flex flex-row gap-2">
            {isSignedIn ? <SignOutButton /> : <SignInButton mode="modal" />}
            <ThemeChanger />
          </div>
        </div>
      </header>
      <Outlet />
    </>
  );
}

function ThemeChanger() {
  const [, setTheme] = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-9 px-0">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme(() => Theme.LIGHT)}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(() => Theme.DARK)}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(() => Theme.DARK)}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
