package com.example.smart_mall_spring.Dtos.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * System health metrics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String status; // "healthy", "warning", "critical"
    private Long activeUsers;
    private Long webSocketConnections;
    private Long databaseSize; // in MB
    private Double avgResponseTime; // in milliseconds
    private Long errorCount24h;
    private Double uptime; // percentage
}
