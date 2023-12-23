import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";

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

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=40&printType=books`,
  ).then((res) => res.json() as Promise<BooksResponse>);

  return json({
    books: uniqueByTitleAndAuthor(response.items).slice(0, 5),
  });
}

function uniqueByTitleAndAuthor(books: Book[]) {
  const uniqueBooks = new Map<string, Book>();

  for (const book of books) {
    const key = `${book.volumeInfo.title} ${book.volumeInfo.authors?.join(
      ", ",
    )}`;
    uniqueBooks.set(key, book);
  }

  return Array.from(uniqueBooks.values());
}

type Book = {
  id: string;
  volumeInfo: {
    title: string;
    previewLink: string;
    imageLinks: {
      extraLarge: string;
      large: string;
      small: string;
      medium: string;
      thumbnail: string;
      smallThumbnail: string;
    } | null;
    authors: string[] | null;
    industryIdentifiers: {
      type: string;
      identifier: string;
    }[];
  };
  language: string;
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: boolean;
  };
};

type BooksResponse = {
  items: Book[];
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(params.get("searchTerm") ?? "");
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);

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
      className="m-4 flex flex-row gap-4"
    >
      <ResizablePanel defaultSize={20} className="flex flex-col gap-2">
        <form method="get" className="flex flex-row gap-2">
          <Input
            type="text"
            name="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
        {data.books.map((book) => (
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
        ))}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
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
                  <a href={book.volumeInfo.previewLink} target="_blank">
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
