import { api } from './api';
import type {
  DashboardOverview,
  RevenueChartData,
  TopShop,
  RecentActivity,
  SystemHealth,
} from '../types/dashboard.types';

const DASHBOARD_BASE_URL = '/api/v1/admin/dashboard';

export interface DateRangeParams {
  startDate?: string; // format: yyyy-MM-dd
  endDate?: string;   // format: yyyy-MM-dd
}

export const dashboardService = {
  /**
   * Get dashboard overview with all statistics
   * @param params Optional date range parameters
   */
  getOverview: async (params?: DateRangeParams): Promise<DashboardOverview> => {
    const response = await api.get<DashboardOverview>(`${DASHBOARD_BASE_URL}/overview`, {
      params
    });
    return response.data;
  },

  /**
   * Get revenue chart data
   * @param days Number of days to display (default: 7, max: 90) - ignored if startDate provided
   * @param params Optional date range parameters
   */
  getRevenueChart: async (days: number = 7, params?: DateRangeParams): Promise<RevenueChartData> => {
    const response = await api.get<RevenueChartData>(
      `${DASHBOARD_BASE_URL}/revenue-chart`,
      { 
        params: params ? params : { days }
      }
    );
    return response.data;
  },

  /**
   * Get top shops by revenue
   * @param limit Number of shops to return (default: 10)
   * @param params Optional date range parameters
   */
  getTopShops: async (limit: number = 10, params?: DateRangeParams): Promise<TopShop[]> => {
    const response = await api.get<TopShop[]>(
      `${DASHBOARD_BASE_URL}/top-shops`,
      { params: { limit, ...params } }
    );
    return response.data;
  },

  /**
   * Get recent activities
   * @param limit Number of activities to return (default: 20)
   */
  getRecentActivities: async (limit: number = 20): Promise<RecentActivity[]> => {
    const response = await api.get<RecentActivity[]>(
      `${DASHBOARD_BASE_URL}/recent-activities`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get system health metrics
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await api.get<SystemHealth>(`${DASHBOARD_BASE_URL}/system-health`);
    return response.data;
  },
};
