import type {
  Category,
  ImportResult,
  LibrarySnapshot,
  Prompt,
  PromptFilters,
  PromptInput,
  Tag
} from '../shared/types';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface PromptBarnApi {
  listLibrary(filters?: PromptFilters): Promise<ApiResult<LibrarySnapshot>>;
  createPrompt(input: PromptInput): Promise<ApiResult<Prompt>>;
  updatePrompt(id: string, input: PromptInput): Promise<ApiResult<Prompt>>;
  duplicatePrompt(id: string): Promise<ApiResult<Prompt>>;
  deletePrompt(id: string): Promise<ApiResult<void>>;
  setPromptFavorite(id: string, favorite: boolean): Promise<ApiResult<Prompt>>;
  createCategory(name: string): Promise<ApiResult<Category>>;
  renameCategory(id: string, name: string): Promise<ApiResult<Category>>;
  deleteCategory(id: string): Promise<ApiResult<void>>;
  deleteTag(id: string): Promise<ApiResult<void>>;
  exportJson(): Promise<ApiResult<{ canceled: true } | { canceled: false; path: string }>>;
  importJson(): Promise<ApiResult<{ canceled: true } | { canceled: false; result: ImportResult }>>;
}

declare global {
  interface Window {
    promptBarn: PromptBarnApi;
  }
}
