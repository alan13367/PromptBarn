import type Database from 'better-sqlite3';
import type { Prompt, PromptFilters, PromptInput, Tag } from '../../shared/types';
import { createId } from '../utils/id';
import { AppError } from '../utils/errors';
import { nowIso } from '../utils/time';
import { TagRepository } from './tagRepository';

type PromptRow = Omit<Prompt, 'favorite' | 'tags'> & { favorite: 0 | 1 };
type TagRow = Tag;

export class PromptRepository {
  private readonly tags: TagRepository;

  constructor(private readonly db: Database.Database) {
    this.tags = new TagRepository(db);
  }

  list(filters: PromptFilters = {}): Prompt[] {
    const values: unknown[] = [];
    const where: string[] = [];

    if (filters.favoritesOnly) where.push('p.favorite = 1');
    if (filters.categoryId) {
      where.push('p.category_id = ?');
      values.push(filters.categoryId);
    }
    if (filters.tagIds && filters.tagIds.length > 0) {
      const placeholders = filters.tagIds.map(() => '?').join(', ');
      where.push(
        `p.id IN (
          SELECT pt.prompt_id
          FROM prompt_tags pt
          WHERE pt.tag_id IN (${placeholders})
          GROUP BY pt.prompt_id
          HAVING COUNT(DISTINCT pt.tag_id) = ?
        )`
      );
      values.push(...filters.tagIds, filters.tagIds.length);
    }
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      const like = `%${term}%`;
      const fts = buildFtsQuery(term);
      where.push(
        `(p.id IN (SELECT prompt_id FROM prompt_search WHERE prompt_search MATCH ?)
          OR c.name LIKE ? COLLATE NOCASE
          OR EXISTS (
            SELECT 1 FROM prompt_tags pt
            JOIN tags t ON t.id = pt.tag_id
            WHERE pt.prompt_id = p.id AND t.name LIKE ? COLLATE NOCASE
          ))`
      );
      values.push(fts, like, like);
    }

    const sql = `
      SELECT p.*, c.name AS category_name
      FROM prompts p
      JOIN categories c ON c.id = p.category_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY p.updated_at DESC`;

    return (this.db.prepare(sql).all(...values) as PromptRow[]).map((row) => this.hydrate(row));
  }

  get(id: string): Prompt {
    const row = this.db
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM prompts p
         JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
      )
      .get(id) as PromptRow | undefined;
    if (!row) throw new AppError('Prompt not found.');
    return this.hydrate(row);
  }

  create(input: PromptInput): Prompt {
    const id = createId();
    const now = nowIso();
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO prompts (id, title, description, body, category_id, favorite, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          input.title.trim(),
          input.description.trim(),
          input.body,
          input.category_id,
          input.favorite ? 1 : 0,
          now,
          now
        );
      this.replaceTags(id, input.tag_names);
    });
    transaction();
    return this.get(id);
  }

  update(id: string, input: PromptInput): Prompt {
    const now = nowIso();
    const transaction = this.db.transaction(() => {
      const result = this.db
        .prepare(
          `UPDATE prompts
           SET title = ?, description = ?, body = ?, category_id = ?, favorite = ?, updated_at = ?
           WHERE id = ?`
        )
        .run(
          input.title.trim(),
          input.description.trim(),
          input.body,
          input.category_id,
          input.favorite ? 1 : 0,
          now,
          id
        );
      if (result.changes === 0) throw new AppError('Prompt not found.');
      this.replaceTags(id, input.tag_names);
    });
    transaction();
    return this.get(id);
  }

  duplicate(id: string): Prompt {
    const source = this.get(id);
    return this.create({
      title: `${source.title} copy`,
      description: source.description,
      body: source.body,
      category_id: source.category_id,
      favorite: false,
      tag_names: source.tags.map((tag) => tag.name)
    });
  }

  delete(id: string): void {
    const result = this.db.prepare('DELETE FROM prompts WHERE id = ?').run(id);
    if (result.changes === 0) throw new AppError('Prompt not found.');
  }

  toggleFavorite(id: string, favorite: boolean): Prompt {
    const result = this.db
      .prepare('UPDATE prompts SET favorite = ?, updated_at = ? WHERE id = ?')
      .run(favorite ? 1 : 0, nowIso(), id);
    if (result.changes === 0) throw new AppError('Prompt not found.');
    return this.get(id);
  }

  private replaceTags(promptId: string, tagNames: string[]): void {
    this.db.prepare('DELETE FROM prompt_tags WHERE prompt_id = ?').run(promptId);
    const unique = [...new Set(tagNames.map((tag) => tag.trim()).filter(Boolean))];
    const insert = this.db.prepare('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');
    for (const tagName of unique) {
      insert.run(promptId, this.tags.findOrCreate(tagName));
    }
  }

  private hydrate(row: PromptRow): Prompt {
    const tags = this.db
      .prepare(
        `SELECT t.*, COUNT(pt2.prompt_id) AS prompt_count
         FROM tags t
         JOIN prompt_tags pt ON pt.tag_id = t.id
         LEFT JOIN prompt_tags pt2 ON pt2.tag_id = t.id
         WHERE pt.prompt_id = ?
         GROUP BY t.id
         ORDER BY lower(t.name)`
      )
      .all(row.id) as TagRow[];
    return {
      ...row,
      favorite: row.favorite === 1,
      tags: tags.map((tag) => ({ ...tag, prompt_count: Number(tag.prompt_count) }))
    };
  }
}

function buildFtsQuery(search: string): string {
  const tokens = search
    .split(/\s+/)
    .map((token) => token.replace(/[^a-zA-Z0-9_]/g, ''))
    .filter(Boolean)
    .slice(0, 8);
  return tokens.length ? tokens.map((token) => `${token}*`).join(' AND ') : '""';
}
