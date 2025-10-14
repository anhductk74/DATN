// import apiClient from '../lib/apiClient';

// export interface NotificationDto {
//   id: string;
//   userId: string;
//   title: string;
//   message: string;
//   type: NotificationType;
//   relatedEntityId?: string;
//   relatedEntityType?: string;
//   isRead: boolean;
//   priority: NotificationPriority;
//   metadata?: Record<string, any>;
//   createdAt: string;
//   updatedAt: string;
//   readAt?: string;
// }

// export interface CreateNotificationDto {
//   userId: string;
//   title: string;
//   message: string;
//   type: NotificationType;
//   relatedEntityId?: string;
//   relatedEntityType?: string;
//   priority?: NotificationPriority;
//   metadata?: Record<string, any>;
// }

// export interface NotificationSettings {
//   userId: string;
//   orderUpdates: boolean;
//   promotions: boolean;
//   systemUpdates: boolean;
//   emailNotifications: boolean;
//   pushNotifications: boolean;
//   smsNotifications: boolean;
// }

// export enum NotificationType {
//   ORDER_CREATED = 'ORDER_CREATED',
//   ORDER_CONFIRMED = 'ORDER_CONFIRMED',
//   ORDER_SHIPPED = 'ORDER_SHIPPED',
//   ORDER_DELIVERED = 'ORDER_DELIVERED',
//   ORDER_CANCELLED = 'ORDER_CANCELLED',
//   PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
//   PAYMENT_FAILED = 'PAYMENT_FAILED',
//   PROMOTION = 'PROMOTION',
//   SYSTEM_UPDATE = 'SYSTEM_UPDATE',
//   VOUCHER_AVAILABLE = 'VOUCHER_AVAILABLE',
//   PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK',
//   SHOP_APPROVED = 'SHOP_APPROVED',
//   SHOP_REJECTED = 'SHOP_REJECTED'
// }

// export enum NotificationPriority {
//   LOW = 'LOW',
//   MEDIUM = 'MEDIUM',
//   HIGH = 'HIGH',
//   URGENT = 'URGENT'
// }

// export interface PaginatedNotifications {
//   content: NotificationDto[];
//   totalElements: number;
//   totalPages: number;
//   size: number;
//   number: number;
//   first: boolean;
//   last: boolean;
// }

// export const notificationApiService = {
//   // Get notifications by user
//   async getNotificationsByUser(
//     userId: string,
//     page: number = 0,
//     size: number = 20,
//     type?: NotificationType,
//     isRead?: boolean
//   ): Promise<PaginatedNotifications> {
//     const params = new URLSearchParams({
//       page: page.toString(),
//       size: size.toString()
//     });
    
//     if (type) params.append('type', type);
//     if (isRead !== undefined) params.append('isRead', isRead.toString());

//     const response = await apiClient.get<PaginatedNotifications>(
//       `/api/notifications/user/${userId}?${params}`
//     );
//     return response.data;
//   },

//   // Get notification by ID
//   async getNotificationById(id: string): Promise<NotificationDto> {
//     const response = await apiClient.get<NotificationDto>(`/api/notifications/${id}`);
//     return response.data;
//   },

//   // Create notification
//   async createNotification(data: CreateNotificationDto): Promise<NotificationDto> {
//     const response = await apiClient.post<NotificationDto>('/api/notifications', data);
//     return response.data;
//   },

//   // Mark notification as read
//   async markAsRead(id: string): Promise<NotificationDto> {
//     const response = await apiClient.put<NotificationDto>(`/api/notifications/${id}/read`);
//     return response.data;
//   },

//   // Mark all notifications as read for user
//   async markAllAsRead(userId: string): Promise<void> {
//     await apiClient.put(`/api/notifications/user/${userId}/read-all`);
//   },

//   // Delete notification
//   async deleteNotification(id: string): Promise<void> {
//     await apiClient.delete(`/api/notifications/${id}`);
//   },

//   // Get unread count
//   async getUnreadCount(userId: string): Promise<number> {
//     const response = await apiClient.get<{ count: number }>(`/api/notifications/user/${userId}/unread-count`);
//     return response.data.count;
//   },

//   // Get notification settings
//   async getNotificationSettings(userId: string): Promise<NotificationSettings> {
//     const response = await apiClient.get<NotificationSettings>(`/api/notifications/settings/${userId}`);
//     return response.data;
//   },

//   // Update notification settings
//   async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
//     const response = await apiClient.put<NotificationSettings>(
//       `/api/notifications/settings/${settings.userId}`, 
//       settings
//     );
//     return response.data;
//   },

//   // Send bulk notifications (admin only)
//   async sendBulkNotifications(notifications: CreateNotificationDto[]): Promise<NotificationDto[]> {
//     const response = await apiClient.post<NotificationDto[]>('/api/notifications/bulk', notifications);
//     return response.data;
//   }
// };