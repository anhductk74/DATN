package com.example.smart_mall_spring.Controllers.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.ShipperBalanceHistory.ShipperBalanceHistoryRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipperBalanceHistory.ShipperBalanceHistoryResponseDto;
import com.example.smart_mall_spring.Services.Logistics.ShipperBalanceHistoryService;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipper-balance")
@RequiredArgsConstructor
public class ShipperBalanceHistoryController {

    private final ShipperBalanceHistoryService service;

    @PostMapping
    public ResponseEntity<ShipperBalanceHistoryResponseDto> create(
            @RequestBody ShipperBalanceHistoryRequestDto dto
    ) {
        return ResponseEntity.ok(service.createDailyHistory(dto));
    }
// can use for shipper app
    @GetMapping("/shipper/{shipperId}")
    public ResponseEntity<List<ShipperBalanceHistoryResponseDto>> getByShipper(
            @PathVariable UUID shipperId
    ) {
        return ResponseEntity.ok(service.getByShipper(shipperId));
    }

    @GetMapping("/date")
    public ResponseEntity<List<ShipperBalanceHistoryResponseDto>> getByDate(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ResponseEntity.ok(service.getByDate(date));
    }

    @GetMapping("/range")
    public ResponseEntity<?> getRange(
            @RequestParam(required = false) UUID shipperId,
            @RequestParam(required = false) UUID companyId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate to
    ) {
        return ResponseEntity.ok(service.getHistoryRange(from, to, shipperId, companyId));
    }
    // can use for shipper app
    @GetMapping("/{id}")
    public ResponseEntity<ShipperBalanceHistoryResponseDto> getDetail(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.getDetail(id));
    }
    // can use for shipper app
    @GetMapping("/shipper/{shipperId}/paged")
    public ResponseEntity<?> getPagedHistory(
            @PathVariable UUID shipperId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getPagedHistory(shipperId, page, size));
    }
}