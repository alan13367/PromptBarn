import { z } from 'zod';
import {
  categoryInputSchema,
  promptFiltersSchema,
  promptInputSchema,
  tagInputSchema
} from '../../shared/schemas';

export const idPayloadSchema = z.object({ id: z.string().min(1) });

export const promptUpdatePayloadSchema = z.object({
  id: z.string().min(1),
  input: promptInputSchema
});

export const favoritePayloadSchema = z.object({
  id: z.string().min(1),
  favorite: z.boolean()
});

export const categoryRenamePayloadSchema = z.object({
  id: z.string().min(1),
  name: categoryInputSchema.shape.name
});

export const libraryListPayloadSchema = promptFiltersSchema.default({});
export { promptInputSchema, categoryInputSchema, tagInputSchema };
