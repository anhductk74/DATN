package com.example.smart_mall_spring.Dtos.UserVoucher;


import com.example.smart_mall_spring.Entities.Orders.Voucher;
import com.example.smart_mall_spring.Entities.Users.UserVoucher;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserVoucherResponseDto {
    private UUID id; // ID của bản ghi user_voucher

    private UUID voucherId;
    private String code;
    private String description;
    private String voucherType;
    private String discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderValue;
    private Boolean used;
    private LocalDateTime collectedAt;
    private LocalDateTime usedAt;
    private Boolean active;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public UserVoucherResponseDto mapToDto(UserVoucher entity) {
        Voucher v = entity.getVoucher();
        UserVoucherResponseDto dto = new UserVoucherResponseDto();
        dto.setId(entity.getId());
        dto.setVoucherId(v.getId());
        dto.setCode(v.getCode());
        dto.setDescription(v.getDescription());
        dto.setVoucherType(v.getType().name());
        dto.setDiscountType(v.getDiscountType().name());
        dto.setDiscountValue(v.getDiscountValue());
        dto.setMaxDiscountAmount(v.getMaxDiscountAmount());
        dto.setMinOrderValue(v.getMinOrderValue());
        dto.setUsed(entity.getUsed());
        dto.setCollectedAt(entity.getCollectedAt());
        dto.setUsedAt(entity.getUsedAt());
        dto.setActive(v.getActive());
        dto.setStartDate(v.getStartDate());
        dto.setEndDate(v.getEndDate());
        return dto;
    }
}