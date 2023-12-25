import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useState } from "react";
import { Book, fetchBooks } from "~/.server/google-books/api";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { searchParams } = new URL(args.request.url);
  const searchTerm = searchParams.get("searchTerm");

  if (!searchTerm) {
    return json({ books: [] });
  }

  const response = await fetchBooks(searchTerm);

  return json({
    books: response,
  });
}

export default function Index() {
  const { books } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(params.get("searchTerm") ?? "");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const { state: navigationState } = useNavigation();

  function toggleBook(book: Book) {
    setSelectedBooks((books) => {
      if (books.includes(book)) {
        return books.filter((b) => b !== book);
      } else {
        return [...books, book];
      }
    });
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="mx-4 flex flex-row gap-4"
    >
      <ResizablePanel defaultSize={20} className="flex flex-col gap-2 pt-4">
        <Form
          method="get"
          className="flex flex-row gap-2"
          action="/suggestions"
        >
          <Input
            type="text"
            name="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </Form>
        {navigationState === "loading" || navigationState === "submitting" ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-28 w-auto" />
            <Skeleton className="h-28 w-auto" />
            <Skeleton className="h-28 w-auto" />
          </div>
        ) : (
          books.map((book) => (
            <Card key={book.id} className="flex flex-row gap-2">
              <img
                src={
                  book.volumeInfo.imageLinks?.smallThumbnail ||
                  "https://placeholder.co/128x194"
                }
                alt={book.volumeInfo.title}
                className="h-22 w-16"
              />
              <aside className="flex flex-col gap-2">
                <span className="font-semibold">{book.volumeInfo.title}</span>
                <span className="text-sm text-muted-foreground">
                  by {book.volumeInfo.authors?.join(", ")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  title="Add"
                  className="self-start"
                  onClick={() => toggleBook(book)}
                >
                  {selectedBooks.includes(book) ? "Remove" : "Add"}
                </Button>
              </aside>
            </Card>
          ))
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="pt-4" defaultSize={80}>
        <h2 className="text-xl font-bold">Selected Books</h2>
        <div className="flex flex-row gap-4">
          {selectedBooks.map((book) => (
            <Card key={book.id}>
              <img
                src={
                  book.volumeInfo.imageLinks?.thumbnail ||
                  "https://placeholder.co/128x194"
                }
                alt={book.volumeInfo.title}
                className="m-auto my-2"
              />
              <CardHeader>
                <CardTitle>{book.volumeInfo.title}</CardTitle>
                <CardDescription>
                  by {book.volumeInfo.authors?.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex gap-2">
                <Button type="button" title="Preview" variant="secondary">
                  <a
                    href={book.volumeInfo.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preview
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  title="Remove"
                  onClick={() => toggleBook(book)}
                >
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
