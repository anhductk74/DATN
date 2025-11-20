import apiClient from '../lib/apiClient';

// Shipper Transaction DTOs based on backend DTOs
export interface ShipperTransactionRequestDto {
  shipperId: string;
  shipmentOrderId: string;
  amount: number;
  transactionType: TransactionType;
  subShipmentOrderId?: string;
}

export interface ShipperTransactionResponseDto {
  id: string;
  shipperId: string;
  shipperName: string;
  shipmentOrderId: string;
  shipmentOrderCode: string;
  amount: number;
  transactionType: TransactionType;
  createdAt: string;
  subShipmentOrderId?: string;
}

export enum TransactionType {
  DELIVERY_FEE = 'DELIVERY_FEE',
  COD_COLLECTION = 'COD_COLLECTION',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
  FUEL_ALLOWANCE = 'FUEL_ALLOWANCE',
  OVERTIME = 'OVERTIME',
  DEDUCTION = 'DEDUCTION'
}

export interface ShipperTransactionSummaryDto {
  shipperId: string;
  shipperName: string;
  totalEarnings: number;
  totalDeductions: number;
  netAmount: number;
  transactionCount: number;
  period: string;
}

export interface TransactionFilterDto {
  shipperId?: string;
  transactionType?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export const shipperTransactionApiService = {
  // Get all shipper transactions
  async getAllTransactions(): Promise<ShipperTransactionResponseDto[]> {
    const response = await apiClient.get<ShipperTransactionResponseDto[]>('/api/logistics/shipper-transactions');
    return response.data;
  },

  // Get transaction by ID
  async getTransactionById(id: string): Promise<ShipperTransactionResponseDto> {
    const response = await apiClient.get<ShipperTransactionResponseDto>(`/api/logistics/shipper-transactions/${id}`);
    return response.data;
  },

  // Get transactions by shipper
  async getTransactionsByShipper(shipperId: string): Promise<ShipperTransactionResponseDto[]> {
    const response = await apiClient.get<ShipperTransactionResponseDto[]>(`/api/logistics/shipper-transactions/shipper/${shipperId}`);
    return response.data;
  },

  // Get transactions by shipment order
  async getTransactionsByShipmentOrder(shipmentOrderId: string): Promise<ShipperTransactionResponseDto[]> {
    const response = await apiClient.get<ShipperTransactionResponseDto[]>(`/api/logistics/shipper-transactions/shipment/${shipmentOrderId}`);
    return response.data;
  },

  // Create new transaction
  async createTransaction(transactionData: ShipperTransactionRequestDto): Promise<ShipperTransactionResponseDto> {
    const response = await apiClient.post<ShipperTransactionResponseDto>('/api/logistics/shipper-transactions', transactionData);
    return response.data;
  },

  // Update transaction
  async updateTransaction(id: string, transactionData: ShipperTransactionRequestDto): Promise<ShipperTransactionResponseDto> {
    const response = await apiClient.put<ShipperTransactionResponseDto>(`/api/logistics/shipper-transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/api/logistics/shipper-transactions/${id}`);
  },

  // Get transactions with filters and pagination
  async getTransactionsWithFilters(filters: TransactionFilterDto): Promise<{
    content: ShipperTransactionResponseDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.shipperId) params.append('shipperId', filters.shipperId);
    if (filters.transactionType) params.append('transactionType', filters.transactionType);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await apiClient.get(`/api/logistics/shipper-transactions/filter?${params}`);
    return response.data;
  },

  // Get shipper transaction summary
  async getShipperTransactionSummary(shipperId: string, dateFrom?: string, dateTo?: string): Promise<ShipperTransactionSummaryDto> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const response = await apiClient.get<ShipperTransactionSummaryDto>(`/api/logistics/shipper-transactions/shipper/${shipperId}/summary?${params}`);
    return response.data;
  },

  // Get total amount collected by shipper
  async getTotalCollected(shipperId: string): Promise<number> {
    const response = await apiClient.get<number>(`/api/logistics/shipper-transactions/shipper/${shipperId}/total-collected`);
    return response.data;
  },

  // Get total amount paid to shipper
  async getTotalPaid(shipperId: string): Promise<number> {
    const response = await apiClient.get<number>(`/api/logistics/shipper-transactions/shipper/${shipperId}/total-paid`);
    return response.data;
  },

  // Get revenue summary for shipper (collected, paid, net, bonus, cod balance)
  async getRevenueSummary(shipperId: string): Promise<{
    totalCollected: number;
    totalBonus: number;
    totalPaid: number;
    netIncome: number;
    codBalance: number;
  }> {
    const response = await apiClient.get<{
      totalCollected: number;
      totalBonus: number;
      totalPaid: number;
      netIncome: number;
      codBalance: number;
    }>(`/api/logistics/shipper-transactions/shipper/${shipperId}/revenue-summary`);
    return response.data;
  },

  // Get transactions by type
  async getTransactionsByType(transactionType: TransactionType): Promise<ShipperTransactionResponseDto[]> {
    const response = await apiClient.get<ShipperTransactionResponseDto[]>(`/api/logistics/shipper-transactions/type/${transactionType}`);
    return response.data;
  },

  // Bulk create transactions
  async bulkCreateTransactions(transactions: ShipperTransactionRequestDto[]): Promise<ShipperTransactionResponseDto[]> {
    const response = await apiClient.post<ShipperTransactionResponseDto[]>('/api/logistics/shipper-transactions/bulk', transactions);
    return response.data;
  },
};
export default shipperTransactionApiService;