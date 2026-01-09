// Dashboard Types
export interface DashboardOverview {
  revenue: RevenueStats;
  shops: ShopStats;
  users: UserStats;
  orders: OrderStats;
  actionsRequired: ActionsRequiredStats;
}

export interface RevenueStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalCommission: number;
  percentChangeFromLastMonth: number;
}

export interface ShopStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  newToday: number;
}

export interface UserStats {
  total: number;
  active: number;
  newToday: number;
  newThisWeek: number;
  withOrders: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  returnRequests: number;
  completionRate: number;
}

export interface ActionsRequiredStats {
  pendingShops: number;
  pendingProducts: number;
  disputes: number;
  pendingWithdrawals: number;
  reportedItems: number;
}

// Revenue Chart Types
export interface RevenueChartData {
  dataPoints: DataPoint[];
  totalRevenue: number;
  averagePerDay: number;
  percentChange: number;
}

export interface DataPoint {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
}

// Top Shop Types
export interface TopShop {
  shopId: string;
  shopName: string;
  shopAvatar: string;
  revenue: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
}

// Recent Activity Types
export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  referenceId: string;
  referenceType: ReferenceType;
}

export type ActivityType = 
  | 'SHOP_REGISTERED'
  | 'ORDER_CREATED'
  | 'REVIEW'
  | 'REPORT'
  | 'DISPUTE';

export type ReferenceType = 
  | 'SHOP'
  | 'ORDER'
  | 'REVIEW'
  | 'REPORT'
  | 'DISPUTE';

// System Health Types
export interface SystemHealth {
  status: HealthStatus;
  activeUsers: number;
  webSocketConnections: number;
  databaseSize: number;
  avgResponseTime: number;
  errorCount24h: number;
  uptime: number;
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';
