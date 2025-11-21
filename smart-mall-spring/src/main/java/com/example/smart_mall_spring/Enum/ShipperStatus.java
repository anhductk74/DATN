package com.example.smart_mall_spring.Enum;

public enum ShipperStatus {
    ACTIVE,      // Rảnh, có thể nhận đơn
    BUSY,        // Đang giao hàng
    INACTIVE,    // Không hoạt động, offline
    ON_LEAVE,    // Nghỉ phép
    SUSPENDED    // Bị khóa tạm thời
}