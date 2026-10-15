import publicApiClient from './publicApiClient';
import type {
  PublicOrderSubmissionRequest,
  PublicOrderSubmissionResponse,
  PublicOrderTrackingResponse,
} from '../types/publicOrder';

export const publicOrderService = {
  /**
   * Submit a new takeaway order from the website.
   * Relies on backend idempotencyKey and authoritative price verification.
   */
  async submitOrder(data: PublicOrderSubmissionRequest): Promise<PublicOrderSubmissionResponse> {
    const response = await publicApiClient.post<{ success: boolean; data: PublicOrderSubmissionResponse }>(
      '/api/v1/public/orders',
      data
    );
    return response.data.data;
  },

  /**
   * Track order by unguessable tracking token.
   */
  async trackOrder(token: string): Promise<PublicOrderTrackingResponse> {
    const response = await publicApiClient.get<{ success: boolean; data: PublicOrderTrackingResponse }>(
      `/api/v1/public/orders/track/${encodeURIComponent(token.trim())}`
    );
    return response.data.data;
  },
};

export default publicOrderService;
