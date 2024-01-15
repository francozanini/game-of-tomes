import { Book } from "~/.server/google-books/api";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../@/components/ui/card";
import { Button } from "../../@/components/ui/button";
import { Form } from "@remix-run/react";

function BookCard({ book: { volumeInfo, id } }: { book: Book }) {
  return (
    <Card>
      <img
        src={
          volumeInfo.imageLinks?.thumbnail || "https://placeholder.co/128x194"
        }
        alt={volumeInfo.title}
        className="m-auto my-2"
      />
      <CardHeader>
        <CardTitle>{volumeInfo.title}</CardTitle>
        <CardDescription>by {volumeInfo.authors?.join(", ")}</CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-2">
        <Button type="button" title="Preview" variant="secondary">
          <a
            href={volumeInfo.previewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview
          </a>
        </Button>
        <Form method="POST">
          <input type="hidden" name="bookId" value={id} />
          <input type="hidden" name="intent" value="remove" />
          <Button type="submit" variant="destructive" title="Remove">
            Remove
          </Button>
        </Form>
      </CardFooter>
    </Card>
  );
}

export function BookCardList({ books }: { books: Book[] }) {
  return (
    <div className="flex flex-row gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
