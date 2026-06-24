import { z } from 'zod';
import { ItemStatus } from '@/generated/prisma/enums';

export const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(ItemStatus).optional(),
  priority: z.number().int().nonnegative().optional(),
});

export type CreateItemDto = z.infer<typeof createItemSchema>;

export const updateItemSchema = createItemSchema.partial();

export type UpdateItemDto = z.infer<typeof updateItemSchema>;

export const listItemsQuerySchema = z.object({
  status: z.enum(ItemStatus).optional(),
});

export type ListItemsQueryDto = z.infer<typeof listItemsQuerySchema>;
