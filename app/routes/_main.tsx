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
          {isSignedIn ? <SignOutButton /> : <SignInButton mode="modal" />}
          <ThemeChanger />
        </div>
      </nav>
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
