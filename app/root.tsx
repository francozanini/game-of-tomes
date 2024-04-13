import { ClerkApp } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { json, LoaderFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "~/globals.css?url";
import {
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeProvider,
  useTheme,
} from "~/theme";
import { clsx } from "clsx";
import { getToast } from "~/.server/primitives/toast";
import { combineHeaders } from "~/.server/primitives/http";
import { useToast } from "~/utils/toast";
import { Toaster } from "~/components/sonner";
import { ReactNode } from "react";

export const links = () => {
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
    { rel: "stylesheet", href: styles },
  ];
};

export const loader: LoaderFunction = (args) =>
  rootAuthLoader(
    args,
    async ({ request }) => {
      const { toast, headers: toastHeaders } = await getToast(request);
      return json({ toast }, { headers: combineHeaders(toastHeaders) });
    },
    { loadUser: true },
  );

function Document({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "dark" | "light" | "system";
}) {
  return (
    <html lang="en" className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <title>game.of.tomes</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  const [theme] = useTheme();
  const { toast } = useLoaderData<typeof loader>();
  useToast(toast);

  return (
    <Document theme={theme ?? "dark"}>
      <div className="flex h-screen flex-col justify-between">
        <div className="flex-1">
          <Outlet />
        </div>
        <Toaster closeButton position="bottom-right" theme={theme ?? "dark"} />
      </div>
    </Document>
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
