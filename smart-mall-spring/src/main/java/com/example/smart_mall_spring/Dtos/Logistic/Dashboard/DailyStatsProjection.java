package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;

import java.math.BigDecimal;

public interface DailyStatsProjection {
    java.sql.Date getDate();
    BigDecimal getCodCollected();
    BigDecimal getCodDeposited();
    BigDecimal getCodRemaining();
}