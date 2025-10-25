package com.example.smart_mall_spring.Enum;

public enum ReturnStatus {
    PENDING,     // Người dùng gửi yêu cầu
    APPROVED,    // Shop duyệt yêu cầu
    REJECTED,    // Shop từ chối
    COMPLETED    // Hoàn tất hoàn trả
}