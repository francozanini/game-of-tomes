import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface UserTable {
  id: Generated<number>;
  name: string;
  username: string;
  email: string;
  password: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
