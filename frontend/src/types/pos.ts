export interface MenuCategory {
  id: number;
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  isVeg: boolean;
  available: boolean;
  displayOrder: number;
}

export type OrderType = 'DINE_IN' | 'PARCEL';
export type OrderStatus = 'OPEN' | 'READY_FOR_BILL' | 'CANCELLED';
export type OrderItemStatus = 'ACTIVE' | 'CANCELLED';

export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  tableNumber?: string;
  orderType: OrderType;
  notes?: string;
  items: OrderItemRequest[];
}

export interface UpdateOrderRequest {
  tableNumber?: string;
  orderType?: OrderType;
  status?: OrderStatus;
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  status: OrderItemStatus;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableNumber: string | null;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  createdByUsername: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
