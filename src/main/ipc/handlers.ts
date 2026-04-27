import { dialog, ipcMain } from 'electron';
import { readFileSync, writeFileSync } from 'node:fs';
import { getDatabase } from '../database/connection';
import { CategoryRepository } from '../database/categoryRepository';
import { ImportExportRepository } from '../database/importExportRepository';
import { PromptRepository } from '../database/promptRepository';
import { TagRepository } from '../database/tagRepository';
import { toUserMessage } from '../utils/errors';
import { importExportSchema } from '../../shared/schemas';
import { channels } from './channels';
import {
  categoryInputSchema,
  categoryRenamePayloadSchema,
  favoritePayloadSchema,
  idPayloadSchema,
  libraryListPayloadSchema,
  promptInputSchema,
  promptUpdatePayloadSchema
} from './validators';

type Handler<T> = () => T;

function safe<T>(handler: Handler<T>): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: handler() };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}

export function registerIpcHandlers(): void {
  const db = getDatabase();
  const prompts = new PromptRepository(db);
  const categories = new CategoryRepository(db);
  const tags = new TagRepository(db);
  const importExport = new ImportExportRepository(db);

  ipcMain.handle(channels.libraryList, (_event, payload: unknown) =>
    safe(() => ({
      prompts: prompts.list(libraryListPayloadSchema.parse(payload)),
      categories: categories.list(),
      tags: tags.list()
    }))
  );

  ipcMain.handle(channels.promptCreate, (_event, payload: unknown) =>
    safe(() => prompts.create(promptInputSchema.parse(payload)))
  );

  ipcMain.handle(channels.promptUpdate, (_event, payload: unknown) =>
    safe(() => {
      const parsed = promptUpdatePayloadSchema.parse(payload);
      return prompts.update(parsed.id, parsed.input);
    })
  );

  ipcMain.handle(channels.promptDuplicate, (_event, payload: unknown) =>
    safe(() => prompts.duplicate(idPayloadSchema.parse(payload).id))
  );

  ipcMain.handle(channels.promptDelete, (_event, payload: unknown) =>
    safe(() => prompts.delete(idPayloadSchema.parse(payload).id))
  );

  ipcMain.handle(channels.promptFavorite, (_event, payload: unknown) =>
    safe(() => {
      const parsed = favoritePayloadSchema.parse(payload);
      return prompts.toggleFavorite(parsed.id, parsed.favorite);
    })
  );

  ipcMain.handle(channels.categoryCreate, (_event, payload: unknown) =>
    safe(() => categories.create(categoryInputSchema.parse(payload).name))
  );

  ipcMain.handle(channels.categoryRename, (_event, payload: unknown) =>
    safe(() => {
      const parsed = categoryRenamePayloadSchema.parse(payload);
      return categories.rename(parsed.id, parsed.name);
    })
  );

  ipcMain.handle(channels.categoryDelete, (_event, payload: unknown) =>
    safe(() => categories.delete(idPayloadSchema.parse(payload).id))
  );

  ipcMain.handle(channels.tagDelete, (_event, payload: unknown) =>
    safe(() => tags.delete(idPayloadSchema.parse(payload).id))
  );

  ipcMain.handle(channels.exportJson, async () =>
    safe(() => {
      const result = dialog.showSaveDialogSync({
        title: 'Export PromptBarn Library',
        defaultPath: `promptbarn-export-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });
      if (!result) return { canceled: true };
      const data = { version: 1, ...importExport.exportAll() };
      writeFileSync(result, JSON.stringify(data, null, 2), 'utf8');
      return { canceled: false, path: result };
    })
  );

  ipcMain.handle(channels.importJson, async () =>
    safe(() => {
      const result = dialog.showOpenDialogSync({
        title: 'Import PromptBarn Library',
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });
      if (!result?.[0]) return { canceled: true };
      const raw = readFileSync(result[0], 'utf8');
      const parsed = importExportSchema.parse(JSON.parse(raw));
      return { canceled: false, result: importExport.importAll(parsed) };
    })
  );
}
