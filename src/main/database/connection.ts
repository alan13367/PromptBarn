import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { app } from 'electron';
import { runMigrations } from './migrations';

let database: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!database) {
    const dbDir = join(app.getPath('userData'), 'database');
    mkdirSync(dbDir, { recursive: true });
    database = new Database(join(dbDir, 'promptbarn.sqlite'));
    database.pragma('journal_mode = WAL');
    database.pragma('foreign_keys = ON');
    runMigrations(database);
  }

  return database;
}

export function closeDatabase(): void {
  database?.close();
  database = null;
}
