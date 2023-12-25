import { db } from "./db";
import { NewUser, UserUpdate } from "~/.server/model/tables/userSchema";

export function createUser(newUser: NewUser) {
  return db.insertInto("user").values(newUser).execute();
}

export function updateUser(id: string, updatedUser: UserUpdate) {
  return db
    .updateTable("user")
    .set(updatedUser)
    .where("externalId", "==", id)
    .execute();
}

export function deleteUser(id: string) {
  return db
    .updateTable("user")
    .set({ deleted: true })
    .where("externalId", "==", id)
    .execute();
}
