import { z } from 'zod';

const idSchema = z.string().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(80);
const isoSchema = z.string().datetime();

export const promptInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).default(''),
  body: z.string().trim().min(1).max(50000),
  category_id: idSchema,
  favorite: z.boolean().default(false),
  tag_names: z.array(nameSchema).max(20).default([])
});

export const promptFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  favoritesOnly: z.boolean().optional(),
  categoryId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).max(20).optional()
});

export const categoryInputSchema = z.object({
  name: nameSchema
});

export const tagInputSchema = z.object({
  name: nameSchema
});

export const importTagSchema = z.object({
  id: idSchema.optional(),
  name: nameSchema,
  created_at: isoSchema.optional(),
  updated_at: isoSchema.optional()
});

export const importCategorySchema = z.object({
  id: idSchema.optional(),
  name: nameSchema,
  created_at: isoSchema.optional(),
  updated_at: isoSchema.optional()
});

export const importPromptSchema = z.object({
  id: idSchema.optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).default(''),
  body: z.string().trim().min(1).max(50000),
  category_id: idSchema.optional(),
  category_name: nameSchema.optional(),
  favorite: z.boolean().default(false),
  created_at: isoSchema.optional(),
  updated_at: isoSchema.optional(),
  tags: z.array(nameSchema).max(20).default([])
});

export const importExportSchema = z.object({
  version: z.literal(1),
  exported_at: isoSchema.optional(),
  categories: z.array(importCategorySchema).default([]),
  tags: z.array(importTagSchema).default([]),
  prompts: z.array(importPromptSchema).default([])
});

export type PromptInputSchema = z.infer<typeof promptInputSchema>;
export type PromptFiltersSchema = z.infer<typeof promptFiltersSchema>;
export type ImportExportPayload = z.infer<typeof importExportSchema>;
