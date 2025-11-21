package com.example.smart_mall_spring.Dtos.Orders;


import com.example.smart_mall_spring.Dtos.Address.AddressResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderVoucher.OrderVoucherResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.Payment.PaymentResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.ShippingFee.ShippingFeeResponseDto;
import com.example.smart_mall_spring.Enum.PaymentMethod;
import com.example.smart_mall_spring.Enum.StatusOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private UUID shopId;
    private String shopAvatar;
    private  UUID addressId;
    private String shopName;
    private UUID shopAddressId;
    private AddressResponseDto addressUser;
    private AddressResponseDto addressShop;
    private StatusOrder status;
    private Double totalAmount;
    private Double shippingFee;
    private Double discountAmount;
    private Double finalAmount;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDto> items; // đã có sẵn
    private List<OrderVoucherResponseDto> vouchers; // đã có sẵn
    private List<OrderStatusHistoryDto> statusHistories; // cần tạo nếu muốn
    private List<ShippingFeeResponseDto> shippingFees; // đã có sẵn
    private PaymentResponseDto payment; // đã có sẵn
}