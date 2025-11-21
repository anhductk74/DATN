package com.example.smart_mall_spring.Enum;

// Loại giao dịch cho ví shop
public enum TransactionType {
    ORDER_PAYMENT,       // Thanh toán từ đơn hàng
    WITHDRAWAL,          // Rút tiền
    REFUND,              // Hoàn tiền
    ADJUSTMENT           // Điều chỉnh (admin)
}
