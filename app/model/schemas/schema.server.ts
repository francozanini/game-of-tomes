import { UserTable } from "./userSchema.server";

export interface Database {
  user: UserTable;
}
