import { Book } from "~/.server/google-books/api";
import { Card } from "../../@/components/ui/card";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SkeletonList } from "~/components/skeleton";

export function BooksSearchResults({
  books,
  booksAlreadySelected = [],
}: {
  books: Book[];
  booksAlreadySelected?: Book[];
}) {
  const { state: navigationState, formAction } = useNavigation();
  const booksLoading = navigationState === "loading" && formAction === "get";
  const addingBook = navigationState === "submitting" && formAction === "post";
  const [ref] = useAutoAnimate();

  if (booksLoading) {
    return <SkeletonList />;
  }

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {books.map((book) => (
        <Card key={book.id} className="flex max-w-lg flex-row gap-2">
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
            <Form method="post">
              <input type="hidden" name="bookId" value={book.id} />
              <input
                type="hidden"
                name="intent"
                value={
                  booksAlreadySelected.map((book) => book.id).includes(book.id)
                    ? "remove"
                    : "add"
                }
              />
              <Button
                type="submit"
                variant="ghost"
                title="Add"
                disabled={addingBook}
                className="self-start"
              >
                {booksAlreadySelected.map((book) => book.id).includes(book.id)
                  ? "Remove"
                  : "Add"}
              </Button>
            </Form>
          </aside>
        </Card>
      ))}
    </div>
  );
}

export function SearchBar({
  initialSearchTerm,
}: {
  initialSearchTerm: string;
}) {
  return (
    <Form method="get" className="flex flex-row gap-2">
      <Input type="text" name="searchTerm" defaultValue={initialSearchTerm} />
      <Button type="submit">Search</Button>
    </Form>
  );
}
