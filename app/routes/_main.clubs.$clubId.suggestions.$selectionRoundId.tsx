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
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Book, fetchBooks, fetchBooksByIds } from "~/.server/google-books/api";
import { getAuth } from "@clerk/remix/ssr.server";
import invariant from "~/utils/invariant";
import {
  addSuggestion,
  findSuggestedBooks,
  removeSuggestion,
} from "~/.server/model/suggestions";
import { BooksSearchResults, SearchBar } from "~/components/bookSearch";
import { BookCardList } from "~/components/bookCard";
import { NumericStringSchema } from "~/utils/types";
import { SuggestBookInput } from "~/utils/suggestedBooks";
import { emitBookSuggestion, emitter } from "~/.server/events/emitter";
import { useLiveLoader } from "~/utils/liveLoader";

export async function loader(args: LoaderFunctionArgs) {
  const { searchParams } = new URL(args.request.url);
  const searchTerm = searchParams.get("searchTerm");
  const clubId = args.params.clubId!;
  const selectionRoundId = args.params.selectionRoundId!;

  const suggestedBooks = findSuggestedBooks(+clubId, +selectionRoundId).then(
    (suggestions) => suggestions.map((suggestion) => suggestion.bookId),
  );

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

    emitBookSuggestion();

    return json({ message: "Added suggestion" });
  } else if (formData.intent === "remove") {
    await removeSuggestion({
      bookId: formData.bookId,
      clubId,
      selectionRoundId,
      userId,
    });

    emitBookSuggestion();

    return json({ message: "Removed suggestion" });
  } else throw new Error("Invalid intent");
}

export default function Index() {
  const { searchedBooks, suggestedBooks } = useLiveLoader<typeof loader>();
  const [params] = useSearchParams();

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="mx-4 flex flex-row gap-4"
    >
      <ResizablePanel defaultSize={20} className="flex flex-col gap-2 pt-4">
        <SearchBar initialSearchTerm={params.get("searchTerm") || ""} />
        <BooksSearchResults
          books={searchedBooks}
          booksAlreadySelected={suggestedBooks}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="pt-4" defaultSize={80}>
        <h2 className="text-xl font-bold">Selected Books</h2>
        <BookCardList books={suggestedBooks} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
