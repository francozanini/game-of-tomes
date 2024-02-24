import { Book } from "~/.server/google-books/api";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../@/components/ui/card";
import { Button } from "../../@/components/ui/button";
import { Form, useNavigation } from "@remix-run/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Skeleton } from "../../@/components/ui/skeleton";
import { SuggestBookInput } from "~/utils/suggestedBooks";

function BookCard({
  book: { volumeInfo, id },
  fading,
}: {
  book: Book;
  fading?: boolean;
}) {
  return (
    <Card className={fading ? "grayscale" : ""}>
      <img
        src={
          volumeInfo.imageLinks?.thumbnail || "https://placeholder.co/128x194"
        }
        alt={volumeInfo.title}
        className="m-auto my-2"
      />
      <CardHeader>
        <CardTitle className={"word-break"}>{volumeInfo.title}</CardTitle>
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
  const { formData } = useNavigation();
  const pendingData = SuggestBookInput.safeParse(formData ?? {});
  const removing = pendingData.success && pendingData.data.intent === "remove";
  const adding = pendingData.success && pendingData.data.intent === "add";

  const [ref] = useAutoAnimate();
  return (
    <div className="flex flex-row flex-wrap gap-4" ref={ref}>
      {adding && <Skeleton className="h-80 w-52" />}
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          fading={removing && pendingData.data.bookId === book.id}
        />
      ))}
    </div>
  );
}
