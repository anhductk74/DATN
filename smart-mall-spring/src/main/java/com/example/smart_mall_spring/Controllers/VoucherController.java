package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Orders.Voucher.VoucherRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.Voucher.VoucherResponseDto;
import com.example.smart_mall_spring.Services.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @PostMapping
    public VoucherResponseDto createVoucher(@RequestBody VoucherRequestDto dto) {
        return voucherService.createVoucher(dto);
    }

    @GetMapping
    public List<VoucherResponseDto> getAllVouchers() {
        return voucherService.getAllVouchers();
    }

    @GetMapping("/{code}")
    public VoucherResponseDto getVoucherByCode(@PathVariable String code) {
        return voucherService.getVoucherByCode(code);
    }

    @PutMapping("/{id}/deactivate")
    public VoucherResponseDto deactivateVoucher(@PathVariable UUID id) {
        return voucherService.deactivateVoucher(id);
    }
}