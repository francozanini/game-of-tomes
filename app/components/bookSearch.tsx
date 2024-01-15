import { Book } from "~/.server/google-books/api";
import { Card } from "../../@/components/ui/card";
import { Form } from "@remix-run/react";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";

export function BooksSearchResults({
  books,
  booksAlreadySelected = [],
}: {
  books: Book[];
  booksAlreadySelected?: Book[];
}) {
  return (
    <>
      {books.map((book) => (
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
            <Form>
              <input type="hidden" name="bookId" value={book.id} />
              <input type="hidden" name="intent" value="add" />
              <Button
                type="submit"
                variant="ghost"
                title="Add"
                className="self-start"
              >
                {booksAlreadySelected.includes(book) ? "Remove" : "Add"}
              </Button>
            </Form>
          </aside>
        </Card>
      ))}
    </>
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
