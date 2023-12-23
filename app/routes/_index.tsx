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
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <form method="GET" action='/'>
        <input type="text" name="searchTerm" placeholder="Search for a book" />
        <button type="submit">Search</button>
      </form>
      <ul>
        {data.books.map((book) => (
          <li key={book.id}>
            <a href={book.volumeInfo.previewLink}>{book.volumeInfo.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
