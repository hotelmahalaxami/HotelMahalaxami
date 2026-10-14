export interface RestaurantTable {
  id: number;
  tableName: string;
  capacity: number;
  active: boolean;
  displayOrder: number;
  isOccupied: boolean;
  currentOrderId?: number | null;
  currentOrderNumber?: string | null;
  occupiedSince?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTableRequest {
  tableName: string;
  capacity: number;
  displayOrder?: number;
}

export interface UpdateTableRequest {
  tableName: string;
  capacity?: number;
  active?: boolean;
  displayOrder?: number;
}
