import { ItemStatus } from '@/generated/prisma/enums';

export interface ItemResponse {
  id: string;
  name: string;
  description: string | null;
  status: ItemStatus;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ItemSingleResponse = ApiResponse<ItemResponse>;
export type ItemListResponse = ApiResponse<ItemResponse[]>;
