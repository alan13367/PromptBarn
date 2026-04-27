import type Database from 'better-sqlite3';
import type { ImportResult } from '../../shared/types';
import type { ImportExportPayload } from '../../shared/schemas';
import { createId } from '../utils/id';
import { nowIso } from '../utils/time';
import { CategoryRepository } from './categoryRepository';
import { PromptRepository } from './promptRepository';
import { TagRepository } from './tagRepository';
import { UNCATEGORIZED_ID } from './migrations';

export class ImportExportRepository {
  private readonly prompts: PromptRepository;
  private readonly categories: CategoryRepository;
  private readonly tags: TagRepository;

  constructor(private readonly db: Database.Database) {
    this.prompts = new PromptRepository(db);
    this.categories = new CategoryRepository(db);
    this.tags = new TagRepository(db);
  }

  exportAll(): Omit<ImportExportPayload, 'version'> {
    const prompts = this.prompts.list();
    return {
      exported_at: nowIso(),
      categories: this.categories.list().map(({ id, name, created_at, updated_at }) => ({
        id,
        name,
        created_at,
        updated_at
      })),
      tags: this.tags.list().map(({ id, name, created_at, updated_at }) => ({ id, name, created_at, updated_at })),
      prompts: prompts.map((prompt) => ({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        body: prompt.body,
        category_id: prompt.category_id,
        category_name: prompt.category_name,
        favorite: prompt.favorite,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at,
        tags: prompt.tags.map((tag) => tag.name)
      }))
    };
  }

  importAll(payload: ImportExportPayload): ImportResult {
    const transaction = this.db.transaction(() => {
      const categoryIdByImportId = new Map<string, string>();
      const categoryIdByName = new Map<string, string>();

      for (const category of this.categories.list()) {
        categoryIdByName.set(category.name.toLowerCase(), category.id);
      }

      for (const category of payload.categories) {
        const name = category.name.trim();
        const existing = categoryIdByName.get(name.toLowerCase());
        const id = existing ?? createId();
        if (!existing) {
          const now = nowIso();
          this.db
            .prepare('INSERT INTO categories (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)')
            .run(id, name, category.created_at ?? now, category.updated_at ?? now);
          categoryIdByName.set(name.toLowerCase(), id);
        }
        if (category.id) categoryIdByImportId.set(category.id, id);
      }

      for (const prompt of payload.prompts) {
        const tagNames = [...new Set(prompt.tags.map((tag) => tag.trim()).filter(Boolean))];
        let categoryId = prompt.category_id ? categoryIdByImportId.get(prompt.category_id) : undefined;
        if (!categoryId && prompt.category_name) {
          categoryId = categoryIdByName.get(prompt.category_name.toLowerCase());
          if (!categoryId) {
            categoryId = this.categories.findOrCreate(prompt.category_name);
            categoryIdByName.set(prompt.category_name.toLowerCase(), categoryId);
          }
        }
        this.prompts.create({
          title: prompt.title,
          description: prompt.description,
          body: prompt.body,
          category_id: categoryId ?? UNCATEGORIZED_ID,
          favorite: prompt.favorite,
          tag_names: tagNames
        });
      }

      for (const tag of payload.tags) {
        this.tags.findOrCreate(tag.name);
      }
    });
    transaction();

    return {
      prompts: payload.prompts.length,
      categories: payload.categories.length,
      tags: payload.tags.length
    };
  }
}
