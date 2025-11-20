package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;

import java.math.BigDecimal;

public interface TopShipperProjection {
    String getFullName();
    BigDecimal getCodCollected();
    BigDecimal getCodRemaining();
}