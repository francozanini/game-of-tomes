import { Kysely } from "kysely";
import { CLUBS } from "../tables/tableNames";
import { DB } from "kysely-codegen";

export async function up(kysely: Kysely<DB>) {
  await kysely
    .insertInto(CLUBS)
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

export async function down(kysely: Kysely<DB>) {
  await kysely.deleteFrom(CLUBS).where("name", "=", "Game of Tomes").execute();
}
