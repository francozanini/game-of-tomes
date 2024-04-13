import { ClerkApp } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import type { LoaderFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "~/globals.css?url";
import { NonFlashOfWrongThemeEls, ThemeProvider, useTheme } from "~/theme";
import { clsx } from "clsx";
import { Toaster } from "../@/components/ui/sonner";

export const links = () => {
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
    { rel: "stylesheet", href: styles },
  ];
};

export const loader: LoaderFunction = (args) =>
  rootAuthLoader(args, { loadUser: true });

function App() {
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <title>game.of.tomes</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body className="h-screen min-h-screen">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

function AppWithProviders() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default ClerkApp(AppWithProviders);
