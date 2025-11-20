import apiClient from '../lib/apiClient';

export interface ShipmentReportRequestDto {
  reportDate: string; // ISO date string format (YYYY-MM-DD)
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  totalCod: number;
  totalShippingFee: number;
  successRate: number;
}

export interface ShipmentReportResponseDto {
  id: string;
  reportDate: string; // ISO date string format (YYYY-MM-DD)
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  totalCod: number;
  totalShippingFee: number;
  successRate: number;
}

export interface ShipmentReportSummary {
  totalReports: number;
  avgSuccessRate: number;
  totalOrdersSum: number;
  totalDeliveredSum: number;
  totalCodSum: number;
  totalShippingFeeSum: number;
}

export class ShipmentReportService {
  private static readonly BASE_URL = '/api/logistics/reports';

  // Lấy tất cả báo cáo
  static async getAllReports(): Promise<ShipmentReportResponseDto[]> {
    const response = await apiClient.get<ShipmentReportResponseDto[]>(this.BASE_URL);
    return response.data;
  }

  // Lấy báo cáo theo ID
  static async getReportById(id: string): Promise<ShipmentReportResponseDto> {
    const response = await apiClient.get<ShipmentReportResponseDto>(
      `${this.BASE_URL}/${id}`
    );
    return response.data;
  }

  // Lấy báo cáo trong khoảng thời gian
  static async getReportsBetween(
    startDate: string,
    endDate: string
  ): Promise<ShipmentReportResponseDto[]> {
    const response = await apiClient.get<ShipmentReportResponseDto[]>(
      `${this.BASE_URL}/range`,
      {
        params: { start: startDate, end: endDate }
      }
    );
    return response.data;
  }

  // Tạo báo cáo mới
  static async createReport(dto: ShipmentReportRequestDto): Promise<ShipmentReportResponseDto> {
    const response = await apiClient.post<ShipmentReportResponseDto>(
      this.BASE_URL,
      dto
    );
    return response.data;
  }

  // Cập nhật báo cáo
  static async updateReport(
    id: string,
    dto: ShipmentReportRequestDto
  ): Promise<ShipmentReportResponseDto> {
    const response = await apiClient.put<ShipmentReportResponseDto>(
      `${this.BASE_URL}/${id}`,
      dto
    );
    return response.data;
  }

  // Xóa báo cáo
  static async deleteReport(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  // Lấy báo cáo theo ngày cụ thể
  static async getReportByDate(date: string): Promise<ShipmentReportResponseDto | null> {
    try {
      const reports = await this.getReportsBetween(date, date);
      return reports.length > 0 ? reports[0] : null;
    } catch (error) {
      console.error('Error fetching report by date:', error);
      return null;
    }
  }

  // Lấy báo cáo của tháng hiện tại
  static async getCurrentMonthReports(): Promise<ShipmentReportResponseDto[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getReportsBetween(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
  }

  // Lấy báo cáo của tuần hiện tại
  static async getCurrentWeekReports(): Promise<ShipmentReportResponseDto[]> {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
    
    return this.getReportsBetween(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }

  // Tạo báo cáo tự động cho ngày hôm qua
  static async generateYesterdayReport(): Promise<ShipmentReportResponseDto> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Gọi API generate để lấy dữ liệu thật
    return this.generateReportForDate(yesterdayStr);
  }

  // Tạo báo cáo cho ngày cụ thể
  static async generateReportForDate(date: string): Promise<ShipmentReportResponseDto> {
    const response = await apiClient.get<ShipmentReportResponseDto>(
      `${this.BASE_URL}/generate`,
      {
        params: { date }
      }
    );
    return response.data;
  }

  // Tính toán thống kê tổng hợp
  static async getReportSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ShipmentReportSummary> {
    try {
      let reports: ShipmentReportResponseDto[];
      
      if (startDate && endDate) {
        reports = await this.getReportsBetween(startDate, endDate);
      } else {
        reports = await this.getAllReports();
      }
      
      // Nếu không có báo cáo, trả về dữ liệu mặc định
      if (!reports || reports.length === 0) {
        return {
          totalReports: 0,
          avgSuccessRate: 0,
          totalOrdersSum: 0,
          totalDeliveredSum: 0,
          totalCodSum: 0,
          totalShippingFeeSum: 0
        };
      }
      
      const totalReports = reports.length;
      const totalOrdersSum = reports.reduce((sum, report) => sum + (report.totalOrders || 0), 0);
      const totalDeliveredSum = reports.reduce((sum, report) => sum + (report.deliveredOrders || 0), 0);
      const totalCodSum = reports.reduce((sum, report) => sum + (report.totalCod || 0), 0);
      const totalShippingFeeSum = reports.reduce((sum, report) => sum + (report.totalShippingFee || 0), 0);
      
      // Tính tỷ lệ thành công trung bình
      const avgSuccessRate = totalReports > 0 
        ? reports.reduce((sum, report) => sum + (report.successRate || 0), 0) / totalReports
        : 0;
      
      return {
        totalReports,
        avgSuccessRate: Number(avgSuccessRate.toFixed(2)), // Làm tròn 2 chữ số thập phân
        totalOrdersSum,
        totalDeliveredSum,
        totalCodSum,
        totalShippingFeeSum
      };
    } catch (error) {
      console.error('Error in getReportSummary:', error);
      // Trả về dữ liệu mặc định nếu có lỗi
      return {
        totalReports: 0,
        avgSuccessRate: 0,
        totalOrdersSum: 0,
        totalDeliveredSum: 0,
        totalCodSum: 0,
        totalShippingFeeSum: 0
      };
    }
  }

  // So sánh hiệu suất giữa hai khoảng thời gian
  static async comparePerformance(
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string
  ): Promise<{
    period1: ShipmentReportSummary;
    period2: ShipmentReportSummary;
    comparison: {
      ordersGrowth: number;
      deliveredGrowth: number;
      successRateChange: number;
      codGrowth: number;
    }
  }> {
    const [period1Summary, period2Summary] = await Promise.all([
      this.getReportSummary(period1Start, period1End),
      this.getReportSummary(period2Start, period2End)
    ]);
    
    const ordersGrowth = period2Summary.totalOrdersSum > 0 
      ? ((period1Summary.totalOrdersSum - period2Summary.totalOrdersSum) / period2Summary.totalOrdersSum) * 100
      : 0;
      
    const deliveredGrowth = period2Summary.totalDeliveredSum > 0
      ? ((period1Summary.totalDeliveredSum - period2Summary.totalDeliveredSum) / period2Summary.totalDeliveredSum) * 100
      : 0;
      
    const successRateChange = period1Summary.avgSuccessRate - period2Summary.avgSuccessRate;
    
    const codGrowth = period2Summary.totalCodSum > 0
      ? ((period1Summary.totalCodSum - period2Summary.totalCodSum) / period2Summary.totalCodSum) * 100
      : 0;
    
    return {
      period1: period1Summary,
      period2: period2Summary,
      comparison: {
        ordersGrowth,
        deliveredGrowth,
        successRateChange,
        codGrowth
      }
    };
  }

  // Xuất báo cáo ra Excel
  static async exportReportsToExcel(
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}/export?${queryString}` : `${this.BASE_URL}/export`;
    
    const response = await apiClient.get(url, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Helper: Format ngày hiển thị
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Helper: Format tỷ lệ thành công
  static formatSuccessRate(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }

  // Helper: Format số tiền
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Helper: Tính tỷ lệ thành công
  static calculateSuccessRate(delivered: number, total: number): number {
    return total > 0 ? (delivered / total) * 100 : 0;
  }

  // Validate dữ liệu báo cáo
  static validateReportData(data: ShipmentReportRequestDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!data.reportDate) {
      errors.push('Ngày báo cáo là bắt buộc');
    }
    
    if (data.totalOrders < 0) {
      errors.push('Tổng số đơn hàng không thể âm');
    }
    
    if (data.deliveredOrders < 0) {
      errors.push('Số đơn giao thành công không thể âm');
    }
    
    if (data.deliveredOrders > data.totalOrders) {
      errors.push('Số đơn giao thành công không thể lớn hơn tổng số đơn');
    }
    
    if (data.successRate < 0 || data.successRate > 100) {
      errors.push('Tỷ lệ thành công phải từ 0 đến 100%');
    }
    
    if (data.totalCod < 0) {
      errors.push('Tổng COD không thể âm');
    }
    
    if (data.totalShippingFee < 0) {
      errors.push('Tổng phí vận chuyển không thể âm');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ShipmentReportService;