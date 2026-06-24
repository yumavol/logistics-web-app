import type { Order } from '@/modules/order/order.schema';

export type OrderResponse = Order;

export type OrderSingleResponse = ApiResponse<OrderResponse>;
export type OrderListResponse = ApiResponse<OrderResponse[]>;
