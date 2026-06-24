import { z } from 'zod';
import { OrderStatus } from '@/generated/prisma/enums';

export const orderSchema = z.object({
  id: z.string(),
  trackingNumber: z.string(),
  senderName: z.string(),
  recipientName: z.string(),
  origin: z.string(),
  destination: z.string(),
  status: z.enum(OrderStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof orderSchema>;

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
  search: z.string().optional(),
});

export type ListOrdersQueryDto = z.infer<typeof listOrdersQuerySchema>;
