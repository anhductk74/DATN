package com.example.smart_mall_spring.Dtos.Orders.Transaction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VnPayPaymentResponseDto {
    private String transactionCode; // vnp_TxnRef
    private String responseCode;    // vnp_ResponseCode
    private Integer status;         // 0 = pending, 1 = success, 2 = failed
    private String message;         // mô tả kết quả thanh toán
}