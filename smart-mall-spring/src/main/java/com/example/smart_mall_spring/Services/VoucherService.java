package com.example.smart_mall_spring.Services;


import com.example.smart_mall_spring.Dtos.Orders.Voucher.VoucherRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.Voucher.VoucherResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Voucher;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Repositories.ShopRepository;
import com.example.smart_mall_spring.Repositories.VoucherRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private ShopRepository shopRepository;

    public VoucherResponseDto createVoucher(VoucherRequestDto dto) {
        if (voucherRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Voucher code already exists!");
        }

        Voucher voucher = new Voucher();
        voucher.setCode(dto.getCode());
        voucher.setDescription(dto.getDescription());
        voucher.setType(dto.getType());
        voucher.setDiscountType(dto.getDiscountType());
        voucher.setDiscountValue(dto.getDiscountValue());
        voucher.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        voucher.setMinOrderValue(dto.getMinOrderValue());
        voucher.setUsageLimit(dto.getUsageLimit());
        voucher.setUsedCount(0);
        voucher.setStartDate(dto.getStartDate());
        voucher.setEndDate(dto.getEndDate());
        voucher.setActive(dto.getActive() != null ? dto.getActive() : true);

        if (dto.getShopId() != null) {
            Shop shop = shopRepository.findById(dto.getShopId())
                    .orElseThrow(() -> new EntityNotFoundException("Not found shop!"));
            voucher.setShop(shop);
        }

        voucherRepository.save(voucher);
        return toResponse(voucher);
    }

    public List<VoucherResponseDto> getAllVouchers() {
        return voucherRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public VoucherResponseDto getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Not found voucher!"));
        return toResponse(voucher);
    }

    public VoucherResponseDto deactivateVoucher(UUID id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Not found voucher!"));
        voucher.setActive(false);
        voucherRepository.save(voucher);
        return toResponse(voucher);
    }

    public boolean isVoucherValid(Voucher voucher) {
        return voucher.getActive()
                && voucher.getUsedCount() < voucher.getUsageLimit()
                && (voucher.getStartDate() == null || !voucher.getStartDate().isAfter(LocalDateTime.now()))
                && (voucher.getEndDate() == null || !voucher.getEndDate().isBefore(LocalDateTime.now()));
    }

    private VoucherResponseDto toResponse(Voucher v) {
        VoucherResponseDto dto = new VoucherResponseDto();
        dto.setId(v.getId());
        dto.setCode(v.getCode());
        dto.setDescription(v.getDescription());
        dto.setType(v.getType());
        dto.setDiscountType(v.getDiscountType());
        dto.setDiscountValue(v.getDiscountValue());
        dto.setMaxDiscountAmount(v.getMaxDiscountAmount());
        dto.setMinOrderValue(v.getMinOrderValue());
        dto.setUsageLimit(v.getUsageLimit());
        dto.setUsedCount(v.getUsedCount());
        dto.setActive(v.getActive());
        dto.setStartDate(v.getStartDate());
        dto.setEndDate(v.getEndDate());
        dto.setShopId(v.getShop() != null ? v.getShop().getId() : null);
        return dto;
    }
}