import { Book } from "~/.server/google-books/api";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/primitives/ui/card";
import { Button } from "~/primitives/ui/button";
import { Form, useNavigation } from "@remix-run/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Skeleton } from "~/primitives/ui/skeleton";
import { SuggestBookInput } from "~/utils/suggestedBooks";
import { cn } from "../../../primitives/lib/utils";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/primitives/ui/tooltip";
import { Tooltip } from "@radix-ui/react-tooltip";

function BookCardTitle({ title }: { title: string }) {
  const maxTitleLength = 18;

  if (title.length <= maxTitleLength) {
    return <CardTitle className="word-break">{title}</CardTitle>;
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <CardTitle className="word-break">
            {title.slice(0, maxTitleLength)}...
          </CardTitle>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function BookCard({
  book: { volumeInfo, id },
  fading,
}: {
  book: Book;
  fading?: boolean;
}) {
  return (
    <Card className={cn("flex w-[300px] flex-col", fading && "grayscale")}>
      <img
        src={
          volumeInfo.imageLinks?.thumbnail || "https://placeholder.co/128x194"
        }
        alt={volumeInfo.title}
        className="m-auto my-2"
      />
      <CardHeader className="flex-1 text-center">
        <BookCardTitle title={volumeInfo.title} />
        <CardDescription>by {volumeInfo.authors?.join(", ")}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center gap-2">
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
