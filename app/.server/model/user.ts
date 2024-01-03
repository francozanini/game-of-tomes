import { db } from "./db";
import { NewUser, UserUpdate } from "~/.server/model/tables/userSchema";

export function createUser(newUser: NewUser) {
  return db.insertInto("users").values(newUser).execute();
}

export function updateUser(id: string, updatedUser: UserUpdate) {
  return db
    .updateTable("users")
    .set(updatedUser)
    .where("id", "==", id)
    .execute();
}

export function deleteUser(id: string) {
  return db
    .updateTable("users")
    .set({ deleted: true })
    .where("id", "==", id)
    .execute();
}
