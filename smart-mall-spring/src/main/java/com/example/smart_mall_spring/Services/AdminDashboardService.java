package com.example.smart_mall_spring.Services;

import com.example.smart_mall_spring.Dtos.Dashboard.*;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for admin dashboard statistics and analytics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {
    
    private final OrderRepository orderRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderReturnRequestRepository orderReturnRequestRepository;
    private final ReviewRepository reviewRepository;
    
    /**
     * Get dashboard overview statistics
     * @param startDate Optional start date (default: first day of current month)
     * @param endDate Optional end date (default: today)
     */
    @Transactional(readOnly = true)
    public DashboardOverviewDto getOverview(LocalDate startDate, LocalDate endDate) {
        // Default date range if not provided
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.withDayOfMonth(1); // First day of current month
        }
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay(); // Include end date
        
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDateTime startOfMonth = today.withDayOfMonth(1);
        LocalDateTime lastMonth = startOfMonth.minusMonths(1);
        
        // Revenue stats (using custom date range)
        Double revenueInRange = orderRepository.sumRevenueByDateRange(startDateTime, endDateTime);
        Double revenueToday = orderRepository.sumRevenueByDateRange(today, LocalDateTime.now());
        Double revenueThisWeek = orderRepository.sumRevenueByDateRange(startOfWeek, LocalDateTime.now());
        Double revenueThisMonth = orderRepository.sumRevenueByDateRange(startOfMonth, LocalDateTime.now());
        Double revenueLastMonth = orderRepository.sumRevenueByDateRange(lastMonth, startOfMonth);
        
        Double percentChange = 0.0;
        if (revenueLastMonth != null && revenueLastMonth > 0) {
            percentChange = ((revenueInRange - revenueLastMonth) / revenueLastMonth) * 100;
        }
        
        // Commission (assuming 5% commission rate)
        Double totalCommission = revenueInRange != null ? revenueInRange * 0.05 : 0.0;
        
        DashboardOverviewDto.RevenueStats revenue = DashboardOverviewDto.RevenueStats.builder()
            .today(revenueToday != null ? revenueToday : 0.0)
            .thisWeek(revenueThisWeek != null ? revenueThisWeek : 0.0)
            .thisMonth(revenueInRange != null ? revenueInRange : 0.0) // Use custom range for "thisMonth"
            .totalCommission(totalCommission)
            .percentChangeFromLastMonth(percentChange)
            .build();
        
        // Shop stats
        Long totalShops = shopRepository.count();
        Long newShopsToday = shopRepository.countByCreatedAtAfter(today);
        
        DashboardOverviewDto.ShopStats shops = DashboardOverviewDto.ShopStats.builder()
            .total(totalShops)
            .active(totalShops) // All shops are considered active (no status field)
            .pending(0L) // No status field
            .inactive(0L) // No status field
            .newToday(newShopsToday)
            .build();
        
        // User stats
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByIsActive(1);
        Long newUsersToday = userRepository.countByCreatedAtAfter(today);
        Long newUsersThisWeek = userRepository.countByCreatedAtAfter(startOfWeek);
        Long usersWithOrders = orderRepository.countDistinctUsers();
        
        DashboardOverviewDto.UserStats users = DashboardOverviewDto.UserStats.builder()
            .total(totalUsers)
            .active(activeUsers)
            .newToday(newUsersToday)
            .newThisWeek(newUsersThisWeek)
            .withOrders(usersWithOrders)
            .build();
        
        // Order stats
        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countByStatus(StatusOrder.PENDING);
        Long processingOrders = orderRepository.countByStatus(StatusOrder.CONFIRMED) + 
                               orderRepository.countByStatus(StatusOrder.PACKED) +
                               orderRepository.countByStatus(StatusOrder.SHIPPING);
        Long completedOrders = orderRepository.countByStatus(StatusOrder.DELIVERED);
        Long cancelledOrders = orderRepository.countByStatus(StatusOrder.CANCELLED);
        Long returnRequests = orderReturnRequestRepository.countPendingRequests();
        
        Double completionRate = 0.0;
        if (totalOrders > 0) {
            completionRate = (completedOrders.doubleValue() / totalOrders.doubleValue()) * 100;
        }
        
        DashboardOverviewDto.OrderStats orders = DashboardOverviewDto.OrderStats.builder()
            .total(totalOrders)
            .pending(pendingOrders)
            .processing(processingOrders)
            .completed(completedOrders)
            .cancelled(cancelledOrders)
            .returnRequests(returnRequests)
            .completionRate(completionRate)
            .build();
        
        // Actions required
        Long pendingProducts = productRepository.countByStatusPending();
        Long disputes = 0L; // TODO: implement disputes
        Long pendingWithdrawals = 0L; // TODO: implement withdrawals
        Long reportedItems = 0L; // TODO: implement reports
        
        DashboardOverviewDto.ActionsRequiredStats actionsRequired = DashboardOverviewDto.ActionsRequiredStats.builder()
            .pendingShops(0L) // No status field in Shop entity
            .pendingProducts(pendingProducts != null ? pendingProducts : 0L)
            .disputes(disputes)
            .pendingWithdrawals(pendingWithdrawals)
            .reportedItems(reportedItems)
            .build();
        
        return DashboardOverviewDto.builder()
            .revenue(revenue)
            .shops(shops)
            .users(users)
            .orders(orders)
            .actionsRequired(actionsRequired)
            .build();
    }
    
    /**
     * Get revenue chart data
     * @param days Number of days (ignored if startDate is provided)
     * @param startDate Optional start date
     * @param endDate Optional end date (default: today)
     */
    @Transactional(readOnly = true)
    public RevenueChartDto getRevenueChart(Integer days, LocalDate startDate, LocalDate endDate) {
        // Determine date range
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start;
        
        if (startDate != null) {
            // Use custom date range
            start = startDate;
            days = (int) java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        } else {
            // Use days parameter
            if (days == null || days <= 0) {
                days = 7; // Default 7 days
            }
            start = end.minusDays(days - 1);
        }
        
        List<RevenueChartDto.DataPoint> dataPoints = new ArrayList<>();
        Double totalRevenue = 0.0;
        DateTimeFormatter labelFormatter = days <= 7 ? 
            DateTimeFormatter.ofPattern("EEE") : // Mon, Tue, Wed
            DateTimeFormatter.ofPattern("MMM dd"); // Jan 01
        
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
            
            Double revenue = orderRepository.sumRevenueByDateRange(dayStart, dayEnd);
            Long orderCount = orderRepository.countByDateRange(dayStart, dayEnd);
            
            dataPoints.add(RevenueChartDto.DataPoint.builder()
                .date(date)
                .label(date.format(labelFormatter))
                .revenue(revenue != null ? revenue : 0.0)
                .orderCount(orderCount)
                .build());
            
            totalRevenue += (revenue != null ? revenue : 0.0);
        }
        
        Double averagePerDay = totalRevenue / days;
        
        // Calculate percent change from previous period
        LocalDate prevStartDate = start.minusDays(days);
        Double prevRevenue = orderRepository.sumRevenueByDateRange(
            prevStartDate.atStartOfDay(), 
            start.atStartOfDay()
        );
        
        Double percentChange = 0.0;
        if (prevRevenue != null && prevRevenue > 0) {
            percentChange = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
        }
        
        return RevenueChartDto.builder()
            .dataPoints(dataPoints)
            .totalRevenue(totalRevenue)
            .averagePerDay(averagePerDay)
            .percentChange(percentChange)
            .build();
    }
    
    /**
     * Get top performing shops
     * @param limit Number of shops to return
     * @param startDate Optional start date (default: first day of current month)
     * @param endDate Optional end date (default: today)
     */
    @Transactional(readOnly = true)
    public List<TopShopDto> getTopShops(Integer limit, LocalDate startDate, LocalDate endDate) {
        if (limit == null || limit <= 0) {
            limit = 10;
        }
        
        // Default date range if not provided
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.withDayOfMonth(1); // First day of current month
        }
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay(); // Include end date
        
        return shopRepository.findTopShopsByRevenue(startDateTime, endDateTime, limit)
            .stream()
            .map(shop -> {
                Double revenue = orderRepository.sumRevenueByShop(shop.getId(), startDateTime, endDateTime);
                Long orderCount = orderRepository.countByShopId(shop.getId());
                Double avgRating = reviewRepository.getAverageRatingByShop(shop.getId());
                Long reviewCount = reviewRepository.countByShopId(shop.getId());
                
                return TopShopDto.builder()
                    .shopId(shop.getId())
                    .shopName(shop.getName())
                    .shopAvatar(shop.getAvatar())
                    .revenue(revenue != null ? revenue : 0.0)
                    .orderCount(orderCount)
                    .rating(avgRating != null ? avgRating : 0.0)
                    .reviewCount(reviewCount)
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get recent activities
     */
    @Transactional(readOnly = true)
    public List<RecentActivityDto> getRecentActivities(Integer limit) {
        if (limit == null || limit <= 0) {
            limit = 20;
        }
        
        List<RecentActivityDto> activities = new ArrayList<>();
        
        // Get recent shops
        shopRepository.findTopByOrderByCreatedAtDesc(limit / 4).forEach(shop -> {
            activities.add(RecentActivityDto.builder()
                .id(shop.getId())
                .type("SHOP_REGISTERED")
                .title("Shop mới đăng ký")
                .description(shop.getName() + " đã đăng ký")
                .icon("🏪")
                .timestamp(shop.getCreatedAt())
                .referenceId(shop.getId())
                .referenceType("SHOP")
                .build());
        });
        
        // Get recent orders
        orderRepository.findTopByOrderByCreatedAtDesc(limit / 4).forEach(order -> {
            activities.add(RecentActivityDto.builder()
                .id(order.getId())
                .type("ORDER_CREATED")
                .title("Đơn hàng mới")
                .description("Đơn hàng #" + order.getId().toString().substring(0, 8))
                .icon("📦")
                .timestamp(order.getCreatedAt())
                .referenceId(order.getId())
                .referenceType("ORDER")
                .build());
        });
        
        // Get recent reviews
        reviewRepository.findTopByOrderByCreatedAtDesc(limit / 4).forEach(review -> {
            activities.add(RecentActivityDto.builder()
                .id(review.getId())
                .type("REVIEW")
                .title("Đánh giá mới")
                .description(review.getRating() + " sao - " + review.getComment())
                .icon("⭐")
                .timestamp(review.getCreatedAt())
                .referenceId(review.getId())
                .referenceType("REVIEW")
                .build());
        });
        
        // Sort by timestamp descending
        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        
        return activities.stream().limit(limit).collect(Collectors.toList());
    }
    
    /**
     * Get system health metrics
     */
    public SystemHealthDto getSystemHealth() {
        // Basic implementation - can be enhanced with actual monitoring
        Long errorCount = 0L; // TODO: implement error tracking
        
        return SystemHealthDto.builder()
            .status("healthy")
            .activeUsers(userRepository.countByIsActive(1))
            .webSocketConnections(0L) // TODO: get from WebSocket handler
            .databaseSize(0L) // TODO: get from database metrics
            .avgResponseTime(0.0) // TODO: implement response time tracking
            .errorCount24h(errorCount)
            .uptime(99.9) // TODO: implement uptime tracking
            .build();
    }
}
