import { Book } from "~/.server/google-books/api";
import { Card, CardContent } from "~/primitives/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/primitives/ui/avatar";

export function VotingCard({ book, rank }: { book: Book; rank: number }) {
  const { volumeInfo } = book;
  return (
    <Card className="hover:border-gray-900">
      <CardContent className="flex flex-row items-center justify-between p-4">
        <Avatar className="h-[32px] w-[32px]">
          <AvatarImage
            className="object-cover"
            src={
              volumeInfo.imageLinks?.smallThumbnail ||
              volumeInfo.imageLinks?.thumbnail ||
              volumeInfo.imageLinks?.small ||
              volumeInfo.imageLinks?.medium ||
              volumeInfo.imageLinks?.large ||
              volumeInfo.imageLinks?.extraLarge
            }
          />
          <AvatarFallback>Cover</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="break-all text-center text-xs font-bold">
            {volumeInfo.title}
          </h3>
          <h4 className="text-center text-xs text-muted-foreground">
            {volumeInfo.authors?.join(", ")}
          </h4>
        </div>
        <Avatar className="h-[32px] w-[32px]">
          <AvatarFallback>{rank}</AvatarFallback>
        </Avatar>
      </CardContent>
    </Card>
  );
}
