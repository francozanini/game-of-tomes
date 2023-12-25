import { db } from "./db";
import { NewUser, UserUpdate } from "./schemas/userSchema";

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
