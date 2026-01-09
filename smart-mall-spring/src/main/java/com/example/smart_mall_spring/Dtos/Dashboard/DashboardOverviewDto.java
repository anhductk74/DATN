package com.example.smart_mall_spring.Dtos.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard overview statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDto {
    
    // Revenue
    private RevenueStats revenue;
    
    // Shops
    private ShopStats shops;
    
    // Users
    private UserStats users;
    
    // Orders
    private OrderStats orders;
    
    // Actions required
    private ActionsRequiredStats actionsRequired;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private Double today;
        private Double thisWeek;
        private Double thisMonth;
        private Double totalCommission;
        private Double percentChangeFromLastMonth;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopStats {
        private Long total;
        private Long active;
        private Long pending;
        private Long inactive;
        private Long newToday;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private Long total;
        private Long active;
        private Long newToday;
        private Long newThisWeek;
        private Long withOrders;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStats {
        private Long total;
        private Long pending;
        private Long processing;
        private Long completed;
        private Long cancelled;
        private Long returnRequests;
        private Double completionRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionsRequiredStats {
        private Long pendingShops;
        private Long pendingProducts;
        private Long disputes;
        private Long pendingWithdrawals;
        private Long reportedItems;
    }
}
