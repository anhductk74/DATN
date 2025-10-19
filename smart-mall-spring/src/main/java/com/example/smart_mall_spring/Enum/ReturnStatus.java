package com.example.smart_mall_spring.Enum;

public enum ReturnStatus {
    PENDING,        // Người dùng gửi yêu cầu, chờ xử lý
    APPROVED,       // Admin hoặc shop đã chấp nhận
    REJECTED,       // Yêu cầu bị từ chối
    REFUNDED,       // Đã hoàn tiền xong
    CANCELED        // Người dùng tự hủy yêu cầu
}