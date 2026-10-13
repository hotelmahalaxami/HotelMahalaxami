import type { OrderItem, OrderType } from './pos';

export type BillStatus = 'UNPAID' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentResponse {
  id: number;
  paymentNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string | null;
  status: PaymentStatus;
  recordedByUsername: string | null;
  createdAt: string;
}

export interface BillResponse {
  id: number;
  billNumber: string;
  orderId: number;
  orderNumber: string;
  tableNumber: string | null;
  orderType: OrderType;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  status: BillStatus;
  notes: string | null;
  createdByUsername: string | null;
  items: OrderItem[];
  payments: PaymentResponse[];
  paidAt: string | null;
  createdAt: string;
}

export interface GenerateBillRequest {
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
}

export interface SettleBillRequest {
  paymentMethod: PaymentMethod;
  amount?: number;
  transactionRef?: string;
  notes?: string;
}
