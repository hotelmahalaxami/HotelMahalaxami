export interface PublicOrderItemSubmission {
  menuItemId: number;
  quantity: number;
  notes?: string;
}

export interface PublicOrderSubmissionRequest {
  customerName: string;
  customerPhone: string;
  pickupNotes?: string;
  idempotencyKey: string;
  items: PublicOrderItemSubmission[];
}

export interface PublicOrderSubmissionResponse {
  orderNumber: string;
  trackingToken: string;
  status: string;
  acceptanceStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  totalAmount: number;
  estimatedPickupMinutes: number;
  message: string;
  createdAt: string;
}

export interface PublicOrderItemDetail {
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PublicOrderTrackingResponse {
  orderNumber: string;
  status: string;
  acceptanceStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  totalAmount: number;
  pickupNotes?: string;
  items: PublicOrderItemDetail[];
  createdAt: string;
  updatedAt: string;
}
