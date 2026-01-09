import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import type { DateRangeParams } from '../services/dashboard.service';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (params?: DateRangeParams) => [...dashboardKeys.all, 'overview', params] as const,
  revenueChart: (days: number, params?: DateRangeParams) => 
    [...dashboardKeys.all, 'revenue-chart', days, params] as const,
  topShops: (limit: number, params?: DateRangeParams) => 
    [...dashboardKeys.all, 'top-shops', limit, params] as const,
  recentActivities: (limit: number) => [...dashboardKeys.all, 'recent-activities', limit] as const,
  systemHealth: () => [...dashboardKeys.all, 'system-health'] as const,
};

/**
 * Hook to get dashboard overview
 * @param params Optional date range parameters
 * @param autoRefresh Enable auto-refresh every 30 seconds (default: true)
 */
export function useDashboardOverview(params?: DateRangeParams, autoRefresh: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.overview(params),
    queryFn: () => dashboardService.getOverview(params),
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 2,
  });
}

/**
 * Hook to get revenue chart data
 * @param days Number of days (default: 7)
 * @param params Optional date range parameters
 */
export function useRevenueChart(days: number = 7, params?: DateRangeParams) {
  return useQuery({
    queryKey: dashboardKeys.revenueChart(days, params),
    queryFn: () => dashboardService.getRevenueChart(days, params),
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to get top shops
 * @param limit Number of shops (default: 10)
 * @param params Optional date range parameters
 */
export function useTopShops(limit: number = 10, params?: DateRangeParams) {
  return useQuery({
    queryKey: dashboardKeys.topShops(limit, params),
    queryFn: () => dashboardService.getTopShops(limit, params),
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to get recent activities
 * @param limit Number of activities (default: 20)
 */
export function useRecentActivities(limit: number = 20) {
  return useQuery({
    queryKey: dashboardKeys.recentActivities(limit),
    queryFn: () => dashboardService.getRecentActivities(limit),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto refresh every 30 seconds
    retry: 2,
  });
}

/**
 * Hook to get system health
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: dashboardKeys.systemHealth(),
    queryFn: () => dashboardService.getSystemHealth(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto refresh every 1 minute
    retry: 2,
  });
}
