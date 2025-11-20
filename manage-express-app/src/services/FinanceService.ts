import apiClient from '../lib/apiClient';

// Enums
export enum ReconciliationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE'
}

// COD Reconciliation DTOs
export interface CodReconciliationRequestDto {
  shipperId: string;
  date?: string; // ISO date string, optional - default = today
}

export interface CodReconciliationResponseDto {
  id: string;
  shipperId: string;
  shipperName: string;
  totalCollected: number;
  totalDeposited: number;
  difference: number;
  status: ReconciliationStatus;
  date: string; // ISO date string
}

export interface CodReconciliationUpdateStatusDto {
  status: ReconciliationStatus;
}

// Shipper Balance History DTOs
export interface ShipperBalanceHistoryRequestDto {
  shipperId: string;
}

export interface ShipperBalanceHistoryResponseDto {
  id: string;
  shipperId: string;
  shipperName: string;
  openingBalance: number;
  collected: number;
  deposited: number;
  bonus: number;
  finalBalance: number;
  date: string; // ISO date string
}

// Paged Response DTO for Shipper Balance History
export interface ShipperBalanceHistoryPagedResponseDto {
  content: ShipperBalanceHistoryResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Finance Report DTO
export interface FinanceReportResponseDto {
  date: string;
  totalCollected: number;
  totalBonus: number;
  totalDeposited: number;
  difference: number;
  [key: string]: any; // Allow for additional fields
}

export class FinanceService {
  private static readonly COD_RECONCILIATION_URL = '/api/logistics/cod-reconciliation';
  private static readonly SHIPPER_BALANCE_URL = '/api/logistics/shipper-balance';
  private static readonly FINANCE_REPORT_URL = '/api/logistics/finance/report';

  // ==================== COD RECONCILIATION ====================
  
  // Tạo đối soát COD
  static async createCodReconciliation(dto: CodReconciliationRequestDto): Promise<CodReconciliationResponseDto> {
    const response = await apiClient.post<CodReconciliationResponseDto>(
      this.COD_RECONCILIATION_URL,
      dto
    );
    return response.data;
  }

  // Lấy đối soát COD theo ngày
  static async getCodReconciliationByDate(date: string): Promise<CodReconciliationResponseDto[]> {
    const response = await apiClient.get<CodReconciliationResponseDto[]>(
      `${this.COD_RECONCILIATION_URL}?date=${date}`
    );
    return response.data;
  }

  // Cập nhật trạng thái đối soát COD
  static async updateCodReconciliationStatus(
    id: string, 
    dto: CodReconciliationUpdateStatusDto
  ): Promise<CodReconciliationResponseDto> {
    const response = await apiClient.put<CodReconciliationResponseDto>(
      `${this.COD_RECONCILIATION_URL}/${id}/status`,
      dto
    );
    return response.data;
  }

  // Tạo đối soát COD theo shipper
  static async createCodReconciliationByShipper(shipperId: string): Promise<CodReconciliationResponseDto> {
    const response = await apiClient.post<CodReconciliationResponseDto>(
      `${this.COD_RECONCILIATION_URL}/shipper/${shipperId}`
    );
    return response.data;
  }

  // Hoàn thành đối soát COD
  static async completeCodReconciliation(id: string): Promise<CodReconciliationResponseDto> {
    const response = await apiClient.put<CodReconciliationResponseDto>(
      `${this.COD_RECONCILIATION_URL}/${id}/complete`
    );
    return response.data;
  }

  // ==================== SHIPPER BALANCE HISTORY ====================

  // Tạo lịch sử số dư shipper hàng ngày
  static async createShipperBalanceHistory(dto: ShipperBalanceHistoryRequestDto): Promise<ShipperBalanceHistoryResponseDto> {
    const response = await apiClient.post<ShipperBalanceHistoryResponseDto>(
      this.SHIPPER_BALANCE_URL,
      dto
    );
    return response.data;
  }

  // Lấy lịch sử số dư theo shipper
  static async getShipperBalanceHistoryByShipper(shipperId: string): Promise<ShipperBalanceHistoryResponseDto[]> {
    const response = await apiClient.get<ShipperBalanceHistoryResponseDto[]>(
      `${this.SHIPPER_BALANCE_URL}/shipper/${shipperId}`
    );
    return response.data;
  }

  // Lấy lịch sử số dư theo ngày
  static async getShipperBalanceHistoryByDate(date: string): Promise<ShipperBalanceHistoryResponseDto[]> {
    const response = await apiClient.get<ShipperBalanceHistoryResponseDto[]>(
      `${this.SHIPPER_BALANCE_URL}/date?date=${date}`
    );
    return response.data;
  }

  // Lấy lịch sử số dư theo khoảng thời gian
  static async getShipperBalanceHistoryRange(
    from: string, 
    to: string,
    shipperId?: string
  ): Promise<ShipperBalanceHistoryResponseDto[]> {
    let url = `${this.SHIPPER_BALANCE_URL}/range?from=${from}&to=${to}`;
    if (shipperId) {
      url += `&shipperId=${shipperId}`;
    }
    
    const response = await apiClient.get<ShipperBalanceHistoryResponseDto[]>(url);
    return response.data;
  }

  // Lấy lịch sử số dư theo khoảng thời gian cho tất cả shipper
  static async getAllShipperBalanceHistoryRange(
    from: string, 
    to: string
  ): Promise<ShipperBalanceHistoryResponseDto[]> {
    return this.getShipperBalanceHistoryRange(from, to);
  }

  // Lấy lịch sử số dư theo khoảng thời gian cho shipper cụ thể
  static async getShipperBalanceHistoryRangeByShipper(
    shipperId: string,
    from: string, 
    to: string
  ): Promise<ShipperBalanceHistoryResponseDto[]> {
    return this.getShipperBalanceHistoryRange(from, to, shipperId);
  }

  // Lấy chi tiết lịch sử số dư theo ID
  static async getShipperBalanceHistoryDetail(id: string): Promise<ShipperBalanceHistoryResponseDto> {
    const response = await apiClient.get<ShipperBalanceHistoryResponseDto>(
      `${this.SHIPPER_BALANCE_URL}/${id}`
    );
    return response.data;
  }

  // Lấy lịch sử số dư theo shipper với phân trang
  static async getShipperBalanceHistoryPaged(
    shipperId: string,
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: ShipperBalanceHistoryResponseDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  }> {
    const response = await apiClient.get(
      `${this.SHIPPER_BALANCE_URL}/shipper/${shipperId}/paged?page=${page}&size=${size}`
    );
    return response.data;
  }

  // ==================== FINANCE REPORT ====================

  // Lấy báo cáo tài chính theo ngày
  static async getFinanceReportByDate(date: string): Promise<FinanceReportResponseDto> {
    const response = await apiClient.get<FinanceReportResponseDto>(
      `${this.FINANCE_REPORT_URL}/date?date=${date}`
    );
    return response.data;
  }

  // ==================== HELPER FUNCTIONS ====================

  // Format trạng thái đối soát
  static formatReconciliationStatus(status: ReconciliationStatus): string {
    const statusMap: Record<ReconciliationStatus, string> = {
      [ReconciliationStatus.PENDING]: 'Chờ xử lý',
      [ReconciliationStatus.PROCESSING]: 'Đang xử lý',
      [ReconciliationStatus.DONE]: 'Hoàn thành'
    };
    return statusMap[status] || status;
  }

  // Lấy màu cho trạng thái đối soát
  static getReconciliationStatusColor(status: ReconciliationStatus): string {
    const colorMap: Record<ReconciliationStatus, string> = {
      [ReconciliationStatus.PENDING]: 'orange',
      [ReconciliationStatus.PROCESSING]: 'blue',
      [ReconciliationStatus.DONE]: 'green'
    };
    return colorMap[status] || 'default';
  }

  // Format số tiền VND
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Format số tiền đơn giản (không ký hiệu ₫)
  static formatAmount(amount: number): string {
    return amount.toLocaleString('vi-VN');
  }

  // Tính chênh lệch và xác định loại
  static calculateDifferenceType(difference: number): {
    type: 'surplus' | 'deficit' | 'balanced';
    color: string;
    text: string;
  } {
    if (difference > 0) {
      return {
        type: 'surplus',
        color: 'green',
        text: 'Thừa'
      };
    } else if (difference < 0) {
      return {
        type: 'deficit',
        color: 'red',
        text: 'Thiếu'
      };
    } else {
      return {
        type: 'balanced',
        color: 'blue',
        text: 'Cân bằng'
      };
    }
  }

  // Validate COD reconciliation request
  static validateCodReconciliationRequest(data: CodReconciliationRequestDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.shipperId) {
      errors.push('Shipper ID là bắt buộc');
    }

    if (data.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.date)) {
        errors.push('Định dạng ngày không hợp lệ (yyyy-MM-dd)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate shipper balance history request
  static validateShipperBalanceHistoryRequest(data: ShipperBalanceHistoryRequestDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.shipperId) {
      errors.push('Shipper ID là bắt buộc');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Tính tổng thu từ danh sách lịch sử
  static calculateTotalCollected(histories: ShipperBalanceHistoryResponseDto[]): number {
    return histories.reduce((total, history) => total + history.collected, 0);
  }

  // Tính tổng nộp từ danh sách lịch sử
  static calculateTotalDeposited(histories: ShipperBalanceHistoryResponseDto[]): number {
    return histories.reduce((total, history) => total + history.deposited, 0);
  }

  // Tính tổng thưởng từ danh sách lịch sử
  static calculateTotalBonus(histories: ShipperBalanceHistoryResponseDto[]): number {
    return histories.reduce((total, history) => total + history.bonus, 0);
  }

  // Lấy số dư cuối kỳ gần nhất
  static getLatestBalance(histories: ShipperBalanceHistoryResponseDto[]): number {
    if (histories.length === 0) return 0;
    
    // Sắp xếp theo ngày giảm dần và lấy số dư cuối kỳ của ngày gần nhất
    const sortedHistories = histories.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedHistories[0].finalBalance;
  }

  // Tạo summary cho shipper balance
  static createBalanceSummary(histories: ShipperBalanceHistoryResponseDto[]): {
    totalCollected: number;
    totalDeposited: number;
    totalBonus: number;
    latestBalance: number;
    recordCount: number;
  } {
    return {
      totalCollected: this.calculateTotalCollected(histories),
      totalDeposited: this.calculateTotalDeposited(histories),
      totalBonus: this.calculateTotalBonus(histories),
      latestBalance: this.getLatestBalance(histories),
      recordCount: histories.length
    };
  }

  // Format ngày hiển thị
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Format datetime hiển thị
  static formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Lấy ngày hôm nay theo định dạng yyyy-MM-dd
  static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Lấy ngày hôm qua theo định dạng yyyy-MM-dd
  static getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Tạo range ngày trong tuần
  static getWeekDateRange(): { start: string; end: string } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  // Tạo range ngày trong tháng
  static getMonthDateRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  // Tạo range ngày tuỳ chỉnh
  static getCustomDateRange(days: number): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days);

    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }

  // Validate date range
  static validateDateRange(from: string, to: string, shipperId?: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!from) {
      errors.push('Ngày bắt đầu là bắt buộc');
    } else if (!dateRegex.test(from)) {
      errors.push('Ngày bắt đầu không hợp lệ (yyyy-MM-dd)');
    }

    if (!to) {
      errors.push('Ngày kết thúc là bắt buộc');
    } else if (!dateRegex.test(to)) {
      errors.push('Ngày kết thúc không hợp lệ (yyyy-MM-dd)');
    }

    if (errors.length === 0) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (fromDate > toDate) {
        errors.push('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      }

      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 365) {
        errors.push('Khoảng thời gian không được vượt quá 365 ngày');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format date range display
  static formatDateRange(from: string, to: string): string {
    const fromFormatted = this.formatDate(from);
    const toFormatted = this.formatDate(to);
    return `${fromFormatted} - ${toFormatted}`;
  }
}

export default FinanceService;
