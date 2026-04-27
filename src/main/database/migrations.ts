import type Database from 'better-sqlite3';
import { createId } from '../utils/id';
import { nowIso } from '../utils/time';

const CURRENT_VERSION = 1;
const UNCATEGORIZED_ID = 'uncategorized';
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prompt_tags (
  prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS prompt_search USING fts5(
  prompt_id UNINDEXED,
  title,
  description,
  body,
  tokenize = 'porter unicode61'
);

CREATE TRIGGER IF NOT EXISTS prompts_ai AFTER INSERT ON prompts BEGIN
  INSERT INTO prompt_search(prompt_id, title, description, body)
  VALUES (new.id, new.title, new.description, new.body);
END;

CREATE TRIGGER IF NOT EXISTS prompts_au AFTER UPDATE OF title, description, body ON prompts BEGIN
  DELETE FROM prompt_search WHERE prompt_id = old.id;
  INSERT INTO prompt_search(prompt_id, title, description, body)
  VALUES (new.id, new.title, new.description, new.body);
END;

CREATE TRIGGER IF NOT EXISTS prompts_ad AFTER DELETE ON prompts BEGIN
  DELETE FROM prompt_search WHERE prompt_id = old.id;
END;
`;

export function runMigrations(db: Database.Database): void {
  db.pragma('foreign_keys = ON');
  const version = Number(db.pragma('user_version', { simple: true }));

  if (version < 1) {
    db.exec(SCHEMA_SQL);
    seedDefaults(db);
    db.pragma(`user_version = ${CURRENT_VERSION}`);
  }
}

function seedDefaults(db: Database.Database): void {
  const now = nowIso();
  db.prepare(
    'INSERT OR IGNORE INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)'
  ).run(UNCATEGORIZED_ID, 'Uncategorized', now, now);

  const promptCount = db.prepare('SELECT COUNT(*) AS count FROM prompts').get() as {
    count: number;
  };
  if (promptCount.count > 0) return;

  const promptId = createId();
  db.prepare(
    `INSERT INTO prompts (id, title, description, body, category_id, favorite, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    promptId,
    'Rewrite for a specific audience',
    'A starter prompt that demonstrates variables.',
    'Rewrite the following for {{audience}} in a {{tone}} tone. Focus on {{topic}}.\n\nText:\n',
    UNCATEGORIZED_ID,
    1,
    now,
    now
  );
}

export { UNCATEGORIZED_ID };
