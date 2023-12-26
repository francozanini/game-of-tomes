import { Kysely } from "kysely";
import { Database } from "~/.server/model/tables/schema";

export async function up(kysely: Kysely<Database>) {
  await kysely
    .insertInto("clubs")
    .values({
      name: "Game of Tomes",
      description:
        "The first rule of the club is you don't talk about the club.",
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 1,
    })
    .execute();
}
