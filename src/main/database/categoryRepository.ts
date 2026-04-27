import type Database from 'better-sqlite3';
import type { Category } from '../../shared/types';
import { createId } from '../utils/id';
import { AppError } from '../utils/errors';
import { nowIso } from '../utils/time';
import { UNCATEGORIZED_ID } from './migrations';

type CategoryRow = Omit<Category, 'prompt_count'> & { prompt_count: number };

export class CategoryRepository {
  constructor(private readonly db: Database.Database) {}

  list(): Category[] {
    return (
      this.db
      .prepare(
        `SELECT c.*, COUNT(p.id) AS prompt_count
         FROM categories c
         LEFT JOIN prompts p ON p.category_id = c.id
         GROUP BY c.id
         ORDER BY CASE WHEN c.id = ? THEN 0 ELSE 1 END, lower(c.name)`
      )
      .all(UNCATEGORIZED_ID) as CategoryRow[]
    )
      .map(mapCategory);
  }

  create(name: string): Category {
    const trimmed = name.trim();
    const now = nowIso();
    const id = createId();
    this.db
      .prepare('INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)')
      .run(id, trimmed, now, now);
    return { id, name: trimmed, created_at: now, updated_at: now, prompt_count: 0 };
  }

  rename(id: string, name: string): Category {
    if (id === UNCATEGORIZED_ID) {
      throw new AppError('The Uncategorized category cannot be renamed.');
    }
    const now = nowIso();
    const result = this.db
      .prepare('UPDATE categories SET name = ?, updated_at = ? WHERE id = ?')
      .run(name.trim(), now, id);
    if (result.changes === 0) throw new AppError('Category not found.');
    return this.get(id);
  }

  delete(id: string): void {
    if (id === UNCATEGORIZED_ID) {
      throw new AppError('The Uncategorized category cannot be deleted.');
    }
    const transaction = this.db.transaction(() => {
      this.db.prepare('UPDATE prompts SET category_id = ?, updated_at = ? WHERE category_id = ?').run(
        UNCATEGORIZED_ID,
        nowIso(),
        id
      );
      this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    });
    transaction();
  }

  get(id: string): Category {
    const row = this.db
      .prepare(
        `SELECT c.*, COUNT(p.id) AS prompt_count
         FROM categories c
         LEFT JOIN prompts p ON p.category_id = c.id
         WHERE c.id = ?
         GROUP BY c.id`
      )
      .get(id) as CategoryRow | undefined;
    if (!row) throw new AppError('Category not found.');
    return mapCategory(row);
  }

  findOrCreate(name: string): string {
    const existing = this.db
      .prepare('SELECT id FROM categories WHERE name = ? COLLATE NOCASE')
      .get(name) as { id: string } | undefined;
    if (existing) return existing.id;
    return this.create(name).id;
  }
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
    prompt_count: Number(row.prompt_count)
  };
}
