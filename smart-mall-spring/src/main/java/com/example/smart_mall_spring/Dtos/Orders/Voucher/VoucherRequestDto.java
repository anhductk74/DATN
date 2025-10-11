package com.example.smart_mall_spring.Dtos.Orders.Voucher;

import com.example.smart_mall_spring.Enum.DiscountType;
import com.example.smart_mall_spring.Enum.VoucherType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class VoucherRequestDto {
    private String code;
    private String description;
    private VoucherType type;
    private DiscountType discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderValue;
    private Integer usageLimit;
    private UUID shopId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
}
