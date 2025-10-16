package com.example.smart_mall_spring.Dtos.UserVoucher;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserVoucherUsageUpdateDto {
    private UUID userVoucherId;
    private Boolean used;
    private LocalDateTime usedAt = LocalDateTime.now();
}