import { Generated } from "kysely";
import { UserTable } from "./user";

export interface Database {
  user: UserTable;
}
