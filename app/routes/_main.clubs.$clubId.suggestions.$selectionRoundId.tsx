import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { Book, fetchBooks, fetchBooksByIds } from "~/.server/google-books/api";
import { db } from "~/.server/model/db";
import { BOOK_SUGGESTIONS } from "~/.server/model/tables";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { getAuth } from "@clerk/remix/ssr.server";
import invariant from "~/utils/invariant";
import { addSuggestion, removeSuggestion } from "~/.server/model/suggestions";
import { SkeletonList } from "~/components/skeleton";
import { BooksSearchResults, SearchBar } from "~/components/bookSearch";
import { BookCardList } from "~/components/bookCard";
import { NumericStringSchema } from "~/utils/types";

export async function loader(args: LoaderFunctionArgs) {
  const { searchParams } = new URL(args.request.url);
  const searchTerm = searchParams.get("searchTerm");
  const clubId = args.params.clubId!;
  const selectionRoundId = args.params.selectionRoundId!;

  const suggestedBooks = db
    .selectFrom(BOOK_SUGGESTIONS)
    .select(["bookId"])
    .where("clubId", "=", +clubId)
    .where("selectionRoundId", "=", +selectionRoundId)
    .execute()
    .then((suggestions) => suggestions.map((suggestion) => suggestion.bookId));

  if (!searchTerm) {
    return json({
      searchedBooks: [] as Book[],
      suggestedBooks: await fetchBooksByIds(await suggestedBooks),
    });
  }

  const [searchedBooks, enrichedSuggestedBooks] = await Promise.all([
    fetchBooks(searchTerm),
    fetchBooksByIds(await suggestedBooks),
  ]);

  return json({
    searchedBooks,
    suggestedBooks: enrichedSuggestedBooks,
  });
}

const SuggestBookInput = zfd.formData({
  bookId: zfd.numeric(),
  intent: zfd.text(z.enum(["add", "remove"])),
});

export async function action(args: ActionFunctionArgs) {
  const formData = SuggestBookInput.parse(await args.request.formData());
  const clubId = NumericStringSchema.parse(args.params.clubId);
  const selectionRoundId = NumericStringSchema.parse(
    args.params.selectionRoundId,
  );
  const { userId } = await getAuth(args);
  invariant(userId, "User must be authenticated");

  if (formData.intent === "add") {
    await addSuggestion({
      bookId: formData.bookId,
      clubId,
      selectionRoundId,
      userId,
    });
    return json({ message: "Added suggestion" });
  } else if (formData.intent === "remove") {
    await removeSuggestion({
      bookId: formData.bookId,
      clubId,
      selectionRoundId,
      userId,
    });
    return json({ message: "Removed suggestion" });
  } else throw new Error("Invalid intent");
}

export default function Index() {
  const { searchedBooks, suggestedBooks } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const { state: navigationState } = useNavigation();

  const booksLoading =
    navigationState === "loading" || navigationState === "submitting";

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="mx-4 flex flex-row gap-4"
    >
      <ResizablePanel defaultSize={20} className="flex flex-col gap-2 pt-4">
        <SearchBar initialSearchTerm={params.get("searchTerm") || ""} />
        {booksLoading ? (
          <SkeletonList />
        ) : (
          <BooksSearchResults
            books={searchedBooks}
            booksAlreadySelected={suggestedBooks}
          />
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="pt-4" defaultSize={80}>
        <h2 className="text-xl font-bold">Selected Books</h2>
        <BookCardList books={suggestedBooks} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
