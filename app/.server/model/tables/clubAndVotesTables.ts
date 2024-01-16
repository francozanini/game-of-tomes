import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface ClubTable {
  id: Generated<number>;
  name: string;
  description: string;
  imageUrl: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Club = Selectable<ClubTable>;
export type NewClub = Insertable<ClubTable>;
export type ClubUpdate = Updateable<ClubTable>;

export type BookTable = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  author: string;
  language: string;
};

export type NewBook = Insertable<BookTable>;
export type BookUpdate = Updateable<BookTable>;
export type Book = Selectable<BookTable>;

export type ClubMemberTable = {
  clubId: number;
  userId: string;
};

export type ClubMember = Selectable<ClubMemberTable>;
export type NewClubMember = Insertable<ClubMemberTable>;
export type ClubMemberUpdate = Updateable<ClubMemberTable>;

export type BookSuggestionTable = {
  bookId: string;
  clubId: number;
  userId: string;
  selectionRoundId: number;
  addedAt: ColumnType<Date, string | undefined, never>;
};

export type BookSuggestion = Selectable<BookSuggestionTable>;
export type NewBookSuggestion = Insertable<BookSuggestionTable>;
export type BookSuggestionUpdate = Updateable<BookSuggestionTable>;

export type VotesTable = {
  bookId: string;
  userId: string;
  clubId: number;
};

export type Vote = Selectable<VotesTable>;
export type NewVote = Insertable<VotesTable>;
export type VoteUpdate = Updateable<VotesTable>;

export type BookSelectionTable = {
  bookId: string;
  clubId: number;
};

export type BookSelection = Selectable<BookSelectionTable>;
export type NewBookSelection = Insertable<BookSelectionTable>;
export type BookSelectionUpdate = Updateable<BookSelectionTable>;

export type SelectionRoundTable = {
  id: Generated<number>;
  clubId: number;
  selectedBookId: number | null;
  state: "suggesting" | "voting" | "closed";
  inviteToken: string;
  createdAt: ColumnType<Date, string | undefined, never>;
};
