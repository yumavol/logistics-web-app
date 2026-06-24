import { OrderStatus } from '@/generated/prisma/enums';

export interface OrderResponse {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  origin: string;
  destination: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderSingleResponse = ApiResponse<OrderResponse>;
export type OrderListResponse = ApiResponse<OrderResponse[]>;
