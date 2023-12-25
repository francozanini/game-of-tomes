import { UserTable } from "./userSchema";
import {
  BookSelectionTable,
  BookSuggestionTable,
  ClubMemberTable,
  ClubTable,
  VotesTable,
} from "~/.server/model/tables/clubAndVotesTables";

export interface Database {
  user: UserTable;
  club: ClubTable;
  suggestion: BookSuggestionTable;
  bookSelection: BookSelectionTable;
  members: ClubMemberTable;
  votes: VotesTable;
}
