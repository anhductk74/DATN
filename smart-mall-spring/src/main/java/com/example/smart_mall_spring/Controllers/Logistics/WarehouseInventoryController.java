package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.WarehouseInventoryItem.WarehouseInventoryItemDto;
import com.example.smart_mall_spring.Services.Logistics.WarehouseInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouses/inventory")
@RequiredArgsConstructor
public class WarehouseInventoryController {

    private final WarehouseInventoryService inventoryService;

    // Lấy danh sách hàng tồn kho theo warehouseId
    @GetMapping("/{warehouseId}")
    public ResponseEntity<List<WarehouseInventoryItemDto>> getInventoryByWarehouse(@PathVariable UUID warehouseId) {
        List<WarehouseInventoryItemDto> items = inventoryService.getInventoryByWarehouse(warehouseId);
        return ResponseEntity.ok(items);
    }

    // Thêm hàng mới vào kho
    @PostMapping("/{warehouseId}/add")
    public ResponseEntity<WarehouseInventoryItemDto> addInventoryItem(
            @PathVariable UUID warehouseId,
            @RequestParam UUID productId,
            @RequestParam int quantity,
            @RequestParam String unit,
            @RequestParam String location) {

        WarehouseInventoryItemDto item = inventoryService.addInventoryItem(warehouseId, productId, quantity, unit, location);
        return new ResponseEntity<>(item, HttpStatus.CREATED);
    }

    // Cập nhật hàng tồn kho
    @PutMapping("/update/{inventoryId}")
    public ResponseEntity<WarehouseInventoryItemDto> updateInventoryItem(
            @PathVariable UUID inventoryId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) String location) {

        WarehouseInventoryItemDto updatedItem = inventoryService.updateInventoryItem(inventoryId, quantity, unit, location);
        return ResponseEntity.ok(updatedItem);
    }

    // Xóa hàng tồn kho
    @DeleteMapping("/delete/{inventoryId}")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable UUID inventoryId) {
        inventoryService.deleteInventoryItem(inventoryId);
        return ResponseEntity.noContent().build();
    }
}
