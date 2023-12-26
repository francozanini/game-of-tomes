import { UserTable } from "./userSchema";
import {
  BookSelectionTable,
  BookSuggestionTable,
  ClubMemberTable,
  ClubTable,
  VotesTable,
} from "~/.server/model/tables/clubAndVotesTables";

export interface Database {
  users: UserTable;
  clubs: ClubTable;
  bookSuggestions: BookSuggestionTable;
  bookSelections: BookSelectionTable;
  clubMembers: ClubMemberTable;
  votes: VotesTable;
}
