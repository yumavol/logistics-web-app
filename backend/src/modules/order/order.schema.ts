import { z } from 'zod';
import { OrderStatus } from '@/generated/prisma/enums';

export const createOrderSchema = z.object({
  senderName: z.string().min(1),
  recipientName: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateStatusSchema = z.object({
  status: z.enum([OrderStatus.PENDING, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED]),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

export const listOrdersQuerySchema = z.object({
  status: z.enum(OrderStatus).optional(),
});

export type ListOrdersQueryDto = z.infer<typeof listOrdersQuerySchema>;
