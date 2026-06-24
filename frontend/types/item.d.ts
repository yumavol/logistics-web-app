type ItemStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

interface ItemResponse {
  id: string;
  name: string;
  description: string | null;
  status: ItemStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
