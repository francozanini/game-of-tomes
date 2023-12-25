import { db } from "./db.server";
import { NewUser, UserUpdate } from "./schemas/userSchema.server";

export function createUser(newUser: NewUser) {
  console.log('creating user');
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
