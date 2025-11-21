package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyListDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyResponseDto;
import com.example.smart_mall_spring.Services.Logistics.ShippingCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipping-companies")
@RequiredArgsConstructor
public class ShippingCompanyController {

    private final ShippingCompanyService shippingCompanyService;

    // Tạo mới
    @PostMapping
    public ResponseEntity<ShippingCompanyResponseDto> create(@RequestBody ShippingCompanyRequestDto dto) {
        return ResponseEntity.ok(shippingCompanyService.create(dto));
    }

    //  Cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<ShippingCompanyResponseDto> update(@PathVariable UUID id,
                                                             @RequestBody ShippingCompanyRequestDto dto) {
        return ResponseEntity.ok(shippingCompanyService.update(id, dto));
    }

    // Danh sách tất cả
    @GetMapping
    public ResponseEntity<List<ShippingCompanyListDto>> getAll() {
        return ResponseEntity.ok(shippingCompanyService.getAll());
    }

    // Tìm theo tên
    @GetMapping("/search")
    public ResponseEntity<List<ShippingCompanyListDto>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(shippingCompanyService.searchByName(name));
    }

    // Lấy chi tiết
    @GetMapping("/{id}")
    public ResponseEntity<ShippingCompanyResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(shippingCompanyService.getById(id));
    }

    // Xoá
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        shippingCompanyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}