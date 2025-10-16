package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.UserVoucher.UserVoucherResponseDto;
import com.example.smart_mall_spring.Services.Users.UserVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-vouchers")
@RequiredArgsConstructor
public class UserVoucherController {

    private final UserVoucherService userVoucherService;

    /** 🔹 User sưu tầm voucher */
    @PostMapping("/collect")
    public ResponseEntity<UserVoucherResponseDto> collectVoucher(
            @RequestParam UUID userId,
            @RequestParam String voucherCode
    ) {
        return ResponseEntity.ok(userVoucherService.collectVoucher(userId, voucherCode));
    }

    /** 🔹 Lấy danh sách voucher user đã sưu tầm */
    @GetMapping("/{userId}")
    public ResponseEntity<List<UserVoucherResponseDto>> getUserVouchers(@PathVariable UUID userId) {
        return ResponseEntity.ok(userVoucherService.getUserVouchers(userId));
    }

    /** 🔹 Đánh dấu voucher đã sử dụng */
    @PostMapping("/use")
    public ResponseEntity<UserVoucherResponseDto> useVoucher(
            @RequestParam UUID userId,
            @RequestParam String voucherCode
    ) {
        return ResponseEntity.ok(userVoucherService.useVoucher(userId, voucherCode));
    }
}