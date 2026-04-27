import type Database from 'better-sqlite3';
import type { Tag } from '../../shared/types';
import { createId } from '../utils/id';
import { nowIso } from '../utils/time';

type TagRow = Omit<Tag, 'prompt_count'> & { prompt_count: number };

export class TagRepository {
  constructor(private readonly db: Database.Database) {}

  list(): Tag[] {
    return (
      this.db
      .prepare(
        `SELECT t.*, COUNT(pt.prompt_id) AS prompt_count
         FROM tags t
         LEFT JOIN prompt_tags pt ON pt.tag_id = t.id
         GROUP BY t.id
         ORDER BY lower(t.name)`
      )
      .all() as TagRow[]
    )
      .map(mapTag);
  }

  findOrCreate(name: string): string {
    const existing = this.db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE').get(name) as
      | { id: string }
      | undefined;
    if (existing) return existing.id;

    const id = createId();
    const now = nowIso();
    this.db
      .prepare('INSERT INTO tags (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)')
      .run(id, name.trim(), now, now);
    return id;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  }
}

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
    prompt_count: Number(row.prompt_count)
  };
}
