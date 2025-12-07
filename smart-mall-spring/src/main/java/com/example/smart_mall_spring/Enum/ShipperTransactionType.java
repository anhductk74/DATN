package com.example.smart_mall_spring.Enum;

// Loại giao dịch cho ví shipper
public enum ShipperTransactionType {
    DELIVERY_FEE,        // Phí giao hàng
    COLLECT_COD,         // Thu tiền hộ
    RETURN_COD,          // Hoàn tiền COD
    PAY_FEE,             // Thanh toán phí
    WITHDRAWAL,          // Rút tiền
    REFUND,              // Hoàn tiền (khi hủy đơn)
    BONUS,               // Thưởng
    PENALTY,             // Phạt
    DEPOSIT_COD,         // Ký quỹ COD
    ADJUSTMENT           // Điều chỉnh (admin)
}
