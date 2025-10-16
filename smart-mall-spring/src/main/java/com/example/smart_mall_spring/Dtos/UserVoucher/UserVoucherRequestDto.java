package com.example.smart_mall_spring.Dtos.UserVoucher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVoucherRequestDto {
    private UUID userId;
    private UUID voucherId;
}