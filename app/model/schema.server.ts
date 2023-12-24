import { Generated } from "kysely";
import { UserTable } from "./user.server";

export interface Database {
  user: UserTable;
}
