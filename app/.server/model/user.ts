import { db } from "./db";
import { NewUser, UserUpdate } from "~/.server/model/tables/userSchema";
import { USERS } from "./tables";

export function createUser(newUser: NewUser) {
  return db.insertInto(USERS).values(newUser).execute();
}

export function updateUser(id: string, updatedUser: UserUpdate) {
  return db.updateTable(USERS).set(updatedUser).where("id", "==", id).execute();
}

export function deleteUser(id: string) {
  return db
    .updateTable(USERS)
    .set({ deleted: true })
    .where("id", "==", id)
    .execute();
}
