export type Id = string;

export interface Category {
  id: Id;
  name: string;
  created_at: string;
  updated_at: string;
  prompt_count: number;
}

export interface Tag {
  id: Id;
  name: string;
  created_at: string;
  updated_at: string;
  prompt_count: number;
}

export interface Prompt {
  id: Id;
  title: string;
  description: string;
  body: string;
  category_id: Id;
  category_name: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

export interface PromptInput {
  title: string;
  description: string;
  body: string;
  category_id: Id;
  favorite: boolean;
  tag_names: string[];
}

export interface PromptFilters {
  search?: string;
  favoritesOnly?: boolean;
  categoryId?: Id | null;
  tagIds?: Id[];
}

export interface LibrarySnapshot {
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
}

export interface ImportResult {
  prompts: number;
  categories: number;
  tags: number;
}

export type ThemePreference = 'light' | 'dark';
