import { db } from "./db";
import { BOOK_SUGGESTIONS } from "./tables";

type Suggestion = {
  bookId: string;
  clubId: number;
  userId: string;
  selectionRoundId: number;
};

export async function addSuggestion({
  bookId,
  clubId,
  userId,
  selectionRoundId,
}: Suggestion) {
  return await db
    .insertInto(BOOK_SUGGESTIONS)
    .values({
      userId,
      clubId,
      selectionRoundId,
      bookId,
    })
    .execute();
}

export function removeSuggestion({
  bookId,
  clubId,
  selectionRoundId,
  userId,
}: Suggestion) {
  return db
    .deleteFrom(BOOK_SUGGESTIONS)
    .where("bookId", "=", bookId)
    .where("clubId", "=", clubId)
    .where("selectionRoundId", "=", selectionRoundId)
    .where("userId", "=", userId)
    .execute();
}

export function findSuggestedBooks(clubId: number, selectionRoundId: number) {
  return db
    .selectFrom(BOOK_SUGGESTIONS)
    .select(["bookId"])
    .where("clubId", "=", clubId)
    .where("selectionRoundId", "=", selectionRoundId)
    .orderBy("addedAt", "desc")
    .execute();
}
