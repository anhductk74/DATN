package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Dashboard.*;
import com.example.smart_mall_spring.Services.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Dashboard REST API
 * All endpoints require ADMIN role
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Dashboard statistics and analytics for admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    
    private final AdminDashboardService adminDashboardService;
    
    @GetMapping("/overview")
    @Operation(
        summary = "Get dashboard overview",
        description = "Get complete dashboard overview including revenue, shops, users, orders, and actions required"
    )
    public ResponseEntity<DashboardOverviewDto> getOverview() {
        return ResponseEntity.ok(adminDashboardService.getOverview());
    }
    
    @GetMapping("/revenue-chart")
    @Operation(
        summary = "Get revenue chart data",
        description = "Get revenue chart data for the specified number of days (default: 7 days)"
    )
    public ResponseEntity<RevenueChartDto> getRevenueChart(
        @Parameter(description = "Number of days to show (default: 7, max: 90)")
        @RequestParam(required = false, defaultValue = "7") Integer days
    ) {
        if (days > 90) {
            days = 90; // Limit to 90 days
        }
        return ResponseEntity.ok(adminDashboardService.getRevenueChart(days));
    }
    
    @GetMapping("/top-shops")
    @Operation(
        summary = "Get top performing shops",
        description = "Get top shops by revenue in the current month"
    )
    public ResponseEntity<List<TopShopDto>> getTopShops(
        @Parameter(description = "Number of shops to return (default: 10)")
        @RequestParam(required = false, defaultValue = "10") Integer limit
    ) {
        return ResponseEntity.ok(adminDashboardService.getTopShops(limit));
    }
    
    @GetMapping("/recent-activities")
    @Operation(
        summary = "Get recent activities",
        description = "Get recent system activities including new shops, orders, and reviews"
    )
    public ResponseEntity<List<RecentActivityDto>> getRecentActivities(
        @Parameter(description = "Number of activities to return (default: 20)")
        @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        return ResponseEntity.ok(adminDashboardService.getRecentActivities(limit));
    }
    
    @GetMapping("/system-health")
    @Operation(
        summary = "Get system health metrics",
        description = "Get system health and performance metrics"
    )
    public ResponseEntity<SystemHealthDto> getSystemHealth() {
        return ResponseEntity.ok(adminDashboardService.getSystemHealth());
    }
}
