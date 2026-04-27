import { create } from 'zustand';
import type { Category, LibrarySnapshot, Prompt, PromptFilters, PromptInput, Tag } from '../../shared/types';
import { promptInputSchema } from '../../shared/schemas';

interface LibraryState extends LibrarySnapshot {
  selectedPromptId: string | null;
  filters: PromptFilters;
  loading: boolean;
  error: string | null;
  notice: string | null;
  setFilters: (filters: Partial<PromptFilters>) => Promise<void>;
  selectPrompt: (id: string | null) => void;
  load: () => Promise<void>;
  savePrompt: (id: string | null, input: PromptInput) => Promise<Prompt | null>;
  duplicatePrompt: (id: string) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  setFavorite: (id: string, favorite: boolean) => Promise<void>;
  createCategory: (name: string) => Promise<Category | null>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  exportJson: () => Promise<void>;
  importJson: () => Promise<void>;
  clearNotice: () => void;
}

const emptySnapshot: LibrarySnapshot = { prompts: [], categories: [], tags: [] };

export const useLibraryStore = create<LibraryState>((set, get) => ({
  ...emptySnapshot,
  selectedPromptId: null,
  filters: {},
  loading: true,
  error: null,
  notice: null,
  setFilters: async (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    await get().load();
  },
  selectPrompt: (id) => set({ selectedPromptId: id }),
  load: async () => {
    set({ loading: true, error: null });
    const result = await window.promptBarn.listLibrary(get().filters);
    if (!result.ok) {
      set({ loading: false, error: result.error });
      return;
    }
    set((state) => ({
      ...result.data,
      loading: false,
      selectedPromptId:
        state.selectedPromptId && result.data.prompts.some((prompt) => prompt.id === state.selectedPromptId)
          ? state.selectedPromptId
          : (result.data.prompts[0]?.id ?? null)
    }));
  },
  savePrompt: async (id, input) => {
    const parsed = promptInputSchema.safeParse(input);
    if (!parsed.success) {
      set({ error: parsed.error.issues[0]?.message ?? 'Invalid prompt.' });
      return null;
    }
    const result = id
      ? await window.promptBarn.updatePrompt(id, parsed.data)
      : await window.promptBarn.createPrompt(parsed.data);
    if (!result.ok) {
      set({ error: result.error });
      return null;
    }
    await get().load();
    set({ selectedPromptId: result.data.id, notice: id ? 'Prompt saved.' : 'Prompt created.' });
    return result.data;
  },
  duplicatePrompt: async (id) => {
    const result = await window.promptBarn.duplicatePrompt(id);
    if (!result.ok) return set({ error: result.error });
    await get().load();
    set({ selectedPromptId: result.data.id, notice: 'Prompt duplicated.' });
  },
  deletePrompt: async (id) => {
    const result = await window.promptBarn.deletePrompt(id);
    if (!result.ok) return set({ error: result.error });
    set({ selectedPromptId: null, notice: 'Prompt deleted.' });
    await get().load();
  },
  setFavorite: async (id, favorite) => {
    const result = await window.promptBarn.setPromptFavorite(id, favorite);
    if (!result.ok) return set({ error: result.error });
    await get().load();
  },
  createCategory: async (name) => {
    const result = await window.promptBarn.createCategory(name);
    if (!result.ok) {
      set({ error: result.error });
      return null;
    }
    await get().load();
    return result.data;
  },
  renameCategory: async (id, name) => {
    const result = await window.promptBarn.renameCategory(id, name);
    if (!result.ok) return set({ error: result.error });
    await get().load();
  },
  deleteCategory: async (id) => {
    const result = await window.promptBarn.deleteCategory(id);
    if (!result.ok) return set({ error: result.error });
    await get().load();
  },
  deleteTag: async (id) => {
    const result = await window.promptBarn.deleteTag(id);
    if (!result.ok) return set({ error: result.error });
    await get().load();
  },
  exportJson: async () => {
    const result = await window.promptBarn.exportJson();
    if (!result.ok) return set({ error: result.error });
    if (!result.data.canceled) set({ notice: 'Library exported.' });
  },
  importJson: async () => {
    const result = await window.promptBarn.importJson();
    if (!result.ok) return set({ error: result.error });
    if (!result.data.canceled) {
      await get().load();
      set({ notice: `Imported ${result.data.result.prompts} prompts.` });
    }
  },
  clearNotice: () => set({ notice: null, error: null })
}));

export function getTagNames(tags: Tag[]): string {
  return tags.map((tag) => tag.name).join(', ');
}
