package com.example.smart_mall_spring.Enum;

public enum StatusOrder {
    PENDING,          // Đang chờ xác nhận
    CONFIRMED,        // Đã xác nhận
    PACKED,           // Đã đóng gói
    SHIPPING,         // Đang vận chuyển
    DELIVERED,        // Đã giao hàng
    CANCELLED,        // Đã hủy
    RETURN_REQUESTED, // Yêu cầu trả hàng
    RETURNED          // Đã trả hàng
}
