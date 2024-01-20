import * as path from "path";
import { promises as fs } from "fs";
import {
  FileMigrationProvider,
  MigrationResult,
  MigrationResultSet,
  Migrator,
  NO_MIGRATIONS,
} from "kysely";
import { db } from "./db";

function createMigrator() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);

  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "/migrations"),
    }),
  });
}

function printResults(results: MigrationResult[] | undefined) {
  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });
}

async function withMigratorDo(
  callback: (migrator: Migrator) => Promise<MigrationResultSet>,
) {
  const migrator = createMigrator();
  const { error, results } = await callback(migrator);
  printResults(results);
  exitIfError(error);
}

function exitIfError(error: unknown) {
  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }
}

async function migrateToLatest() {
  await withMigratorDo((migrator) => migrator.migrateToLatest());
}

async function rollbackLatest() {
  await withMigratorDo((migrator) => migrator.migrateDown());
}

async function rollbackAll() {
  await withMigratorDo((migrator) => migrator.migrateTo(NO_MIGRATIONS));
}

const command = process.argv[2];

if (command === "rollbackLatest") {
  await rollbackLatest();
  await db.destroy();
} else if (command === "migrateToLatest") {
  await migrateToLatest();
  await db.destroy();
} else if (command === "recreate") {
  await rollbackAll();
  await migrateToLatest();
  await db.destroy();
} else {
  console.error(`unknown command: ${command}`);
  process.exit(1);
}
