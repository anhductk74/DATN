package com.example.smart_mall_spring.Enum;

public enum WithdrawalStatus {
    PENDING,      // Đang chờ xử lý
    APPROVED,     // Đã được admin phê duyệt
    REJECTED,     // Bị từ chối
    COMPLETED     // Đã hoàn thành chuyển tiền
}
