import { Command, CommandInput, CommandItem, CommandEmpty, CommandGroup, CommandList  } from "@/components/ui/command";
import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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

  // fetch from google books api
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`
  ).then((res) => res.json() as Promise<BooksResponse>);

  return json({books: response.items});
}

type Book = {
  id: string;
  volumeInfo: {
    title: string;
    previewLink: string;
  };
};

type BooksResponse = {
  items: Book[];
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <Command className="rounded-lg border shadow-md max-w-96">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          {data.books.length === 0 && <CommandEmpty>Search for books</CommandEmpty>}
          {data.books.length > 0 && <CommandGroup heading='Results'>
          {data.books.map((book) => (
            <CommandItem key={book.id}>
              <a href={book.volumeInfo.previewLink}>{book.volumeInfo.title}</a>
            </CommandItem>
          ))}
          </CommandGroup>}
        </CommandList>
      </Command>
    </div>
  );
}
