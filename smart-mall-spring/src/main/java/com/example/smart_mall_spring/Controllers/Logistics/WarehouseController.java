package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.WarehouseInventoryItem.WarehouseStatisticsResponse;
import com.example.smart_mall_spring.Enum.WarehouseStatus;
import com.example.smart_mall_spring.Services.Logistics.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<List<WarehouseResponseDto>> getAll() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<WarehouseResponseDto>> getByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(warehouseService.getByShippingCompany(companyId));
    }

    @PostMapping
    public ResponseEntity<WarehouseResponseDto> create(@RequestBody WarehouseRequestDto dto) {
        return ResponseEntity.ok(warehouseService.createWarehouse(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseResponseDto> update(@PathVariable UUID id, @RequestBody WarehouseRequestDto dto) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }
    // ----------- MỚI -----------
    // Thống kê kho
    @GetMapping("/statistics")
    public ResponseEntity<WarehouseStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(warehouseService.getWarehouseStatistics());
    }

    // Cập nhật trạng thái kho
    @PutMapping("/{id}/status")
    public ResponseEntity<WarehouseResponseDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam WarehouseStatus status) {   // Hoặc @RequestBody nếu gửi JSON { "status": "ACTIVE" }
        return ResponseEntity.ok(warehouseService.updateWarehouseStatus(id, status));
    }
}