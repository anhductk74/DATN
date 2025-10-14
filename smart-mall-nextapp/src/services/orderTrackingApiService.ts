import apiClient from '../lib/apiClient';

export interface OrderTrackingLogResponse {
  id: string;
  carrier: string;
  trackingNumber: string;
  currentLocation: string;
  statusDescription: string;
  updatedAt: string;
}

export interface OrderTrackingLogRequest {
  carrier: string;
  trackingNumber: string;
  currentLocation: string;
  statusDescription: string;
}

export const orderTrackingApiService = {
  // Get tracking logs by order ID
  async getTrackingLogs(orderId: string): Promise<OrderTrackingLogResponse[]> {
    const response = await apiClient.get<OrderTrackingLogResponse[]>(`/api/order-tracking/${orderId}`);
    return response.data;
  },

  // Add tracking log manually
  async addTrackingLog(orderId: string, data: OrderTrackingLogRequest): Promise<void> {
    const params = new URLSearchParams({
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      currentLocation: data.currentLocation,
      statusDescription: data.statusDescription
    });
    
    await apiClient.post(`/api/order-tracking/${orderId}/add-log?${params}`);
  }
};