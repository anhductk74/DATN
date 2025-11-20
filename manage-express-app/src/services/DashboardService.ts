import apiClient from '../lib/apiClient';

// Dashboard DTOs based on backend structure
export interface DashboardSummaryDto {
  totalShippers: number;
  totalShipmentOrders: number;
  totalCodCollected: number;
  totalCodDeposited: number;
  totalCodRemaining: number;
  totalBonus: number;
  totalShippingFee: number;
}

export interface DashboardChartPointDto {
  date: string;
  codCollected: number;
  codDeposited: number;
  balance: number;
}

export interface TopShipperDto {
  shipperName: string;
  totalCod: number;
  totalBalance: number;
}

export interface DashboardResponseDto {
  summary: DashboardSummaryDto;
  chart: DashboardChartPointDto[];
  topShippers: TopShipperDto[];
}

export class DashboardService {
  private static readonly DASHBOARD_URL = '/api/dashboard';

  // Get dashboard data for date range
  static async getDashboard(fromDate: string, toDate: string): Promise<DashboardResponseDto> {
    const response = await apiClient.get<DashboardResponseDto>(
      `${this.DASHBOARD_URL}?from=${fromDate}&to=${toDate}`
    );
    return response.data;
  }

  // Get dashboard data for today
  static async getTodayDashboard(): Promise<DashboardResponseDto> {
    const today = this.getTodayString();
    return this.getDashboard(today, today);
  }

  // Get dashboard data for last 7 days
  static async getWeeklyDashboard(): Promise<DashboardResponseDto> {
    const end = this.getTodayString();
    const start = this.getDateString(-6); // Last 7 days including today
    return this.getDashboard(start, end);
  }

  // Get dashboard data for last 30 days
  static async getMonthlyDashboard(): Promise<DashboardResponseDto> {
    const end = this.getTodayString();
    const start = this.getDateString(-29); // Last 30 days including today
    return this.getDashboard(start, end);
  }

  // Get dashboard data for current month
  static async getCurrentMonthDashboard(): Promise<DashboardResponseDto> {
    const { start, end } = this.getMonthDateRange();
    return this.getDashboard(start, end);
  }

  // ==================== HELPER FUNCTIONS ====================

  // Format currency VND
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Format number with Vietnamese locale
  static formatNumber(num: number): string {
    return num.toLocaleString('vi-VN');
  }

  // Format percentage
  static formatPercentage(percentage: number): string {
    return `${percentage.toFixed(2)}%`;
  }

  // Format date for display
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Format date for chart display (short format)
  static formatChartDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Calculate percentage
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  // Calculate collection rate
  static calculateCollectionRate(collected: number, deposited: number): number {
    if (collected === 0) return 0;
    return (deposited / collected) * 100;
  }

  // Get today date string (yyyy-MM-dd)
  static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get date string with offset days
  static getDateString(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
  }

  // Get week date range (Monday to Sunday)
  static getWeekDateRange(): { start: string; end: string } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  }

  // Get current month date range
  static getMonthDateRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  // Validate date range
  static validateDateRange(fromDate: string, toDate: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!fromDate) {
      errors.push('Ngày bắt đầu là bắt buộc');
    } else if (!dateRegex.test(fromDate)) {
      errors.push('Ngày bắt đầu không hợp lệ (yyyy-MM-dd)');
    }

    if (!toDate) {
      errors.push('Ngày kết thúc là bắt buộc');
    } else if (!dateRegex.test(toDate)) {
      errors.push('Ngày kết thúc không hợp lệ (yyyy-MM-dd)');
    }

    if (errors.length === 0) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        errors.push('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
      }

      const diffTime = Math.abs(to.getTime() - from.getTime());
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

  // Get performance status based on collection rate
  static getPerformanceStatus(rate: number): {
    status: 'excellent' | 'good' | 'warning' | 'poor';
    color: string;
    text: string;
  } {
    if (rate >= 90) {
      return { status: 'excellent', color: '#52c41a', text: 'Xuất sắc' };
    } else if (rate >= 70) {
      return { status: 'good', color: '#1890ff', text: 'Tốt' };
    } else if (rate >= 50) {
      return { status: 'warning', color: '#faad14', text: 'Cần cải thiện' };
    } else {
      return { status: 'poor', color: '#ff4d4f', text: 'Kém' };
    }
  }

  // Get trend indicator
  static getTrendIndicator(current: number, previous: number): {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
    color: string;
  } {
    if (previous === 0) {
      return { trend: 'stable', percentage: 0, color: '#8c8c8c' };
    }

    const change = ((current - previous) / previous) * 100;
    
    if (Math.abs(change) < 1) {
      return { trend: 'stable', percentage: change, color: '#8c8c8c' };
    } else if (change > 0) {
      return { trend: 'up', percentage: change, color: '#52c41a' };
    } else {
      return { trend: 'down', percentage: Math.abs(change), color: '#ff4d4f' };
    }
  }

  // Calculate daily average
  static calculateDailyAverage(total: number, days: number): number {
    if (days === 0) return 0;
    return total / days;
  }

  // Get chart data for visualization
  static prepareChartData(chartPoints: DashboardChartPointDto[]): {
    dates: string[];
    collected: number[];
    deposited: number[];
    balance: number[];
  } {
    return {
      dates: chartPoints.map(point => this.formatChartDate(point.date)),
      collected: chartPoints.map(point => point.codCollected),
      deposited: chartPoints.map(point => point.codDeposited),
      balance: chartPoints.map(point => point.balance)
    };
  }

  // Get summary statistics
  static getSummaryStats(summary: DashboardSummaryDto): {
    collectionRate: number;
    averageOrderValue: number;
    bonusRate: number;
    remainingPercentage: number;
  } {
    return {
      collectionRate: this.calculateCollectionRate(summary.totalCodCollected, summary.totalCodDeposited),
      averageOrderValue: summary.totalShipmentOrders > 0 ? summary.totalCodCollected / summary.totalShipmentOrders : 0,
      bonusRate: this.calculatePercentage(summary.totalBonus, summary.totalCodCollected),
      remainingPercentage: this.calculatePercentage(summary.totalCodRemaining, summary.totalCodCollected)
    };
  }

  // Format date range display
  static formatDateRangeDisplay(fromDate: string, toDate: string): string {
    if (fromDate === toDate) {
      return `Ngày ${this.formatDate(fromDate)}`;
    }
    return `Từ ${this.formatDate(fromDate)} đến ${this.formatDate(toDate)}`;
  }

  // Get quick date options
  static getQuickDateOptions(): Array<{
    label: string;
    value: string;
    dateRange: { start: string; end: string };
  }> {
    const today = this.getTodayString();
    const yesterday = this.getDateString(-1);
    const weekRange = this.getWeekDateRange();
    const monthRange = this.getMonthDateRange();

    return [
      {
        label: 'Hôm nay',
        value: 'today',
        dateRange: { start: today, end: today }
      },
      {
        label: 'Hôm qua',
        value: 'yesterday',
        dateRange: { start: yesterday, end: yesterday }
      },
      {
        label: '7 ngày qua',
        value: 'last7days',
        dateRange: { start: this.getDateString(-6), end: today }
      },
      {
        label: 'Tuần này',
        value: 'thisweek',
        dateRange: weekRange
      },
      {
        label: '30 ngày qua',
        value: 'last30days',
        dateRange: { start: this.getDateString(-29), end: today }
      },
      {
        label: 'Tháng này',
        value: 'thismonth',
        dateRange: monthRange
      }
    ];
  }
}

export default DashboardService;