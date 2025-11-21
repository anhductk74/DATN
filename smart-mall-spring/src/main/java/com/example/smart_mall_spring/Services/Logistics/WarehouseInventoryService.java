package com.example.smart_mall_spring.Services.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.WarehouseInventoryItem.WarehouseInventoryItemDto;
import com.example.smart_mall_spring.Entities.Logistics.Warehouse;
import com.example.smart_mall_spring.Entities.Logistics.WarehouseInventory;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Exception.EntityNotFoundException;
import com.example.smart_mall_spring.Repositories.Logistics.WarehouseInventoryRepository;
import com.example.smart_mall_spring.Repositories.Logistics.WarehouseRepository;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class WarehouseInventoryService {

    private final WarehouseInventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    // Lấy danh sách hàng trong kho
    public List<WarehouseInventoryItemDto> getInventoryByWarehouse(UUID warehouseId) {
        List<WarehouseInventory> items = inventoryRepository.findByWarehouse_Id(warehouseId);
        return items.stream().map(item -> WarehouseInventoryItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .category(item.getProduct().getCategory() != null ? item.getProduct().getCategory().getName() : "")
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .location(item.getLocation())
                .lastUpdated(item.getUpdatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    // Thêm hàng mới vào kho
    public WarehouseInventoryItemDto addInventoryItem(UUID warehouseId, UUID productId, int quantity, String unit, String location) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new EntityNotFoundException("Kho không tồn tại: " + warehouseId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại: " + productId));

        WarehouseInventory inventory = new WarehouseInventory();
        inventory.setWarehouse(warehouse);
        inventory.setProduct(product);
        inventory.setQuantity(quantity);
        inventory.setUnit(unit);
        inventory.setLocation(location);

        // Cập nhật currentStock của warehouse
        warehouse.setCurrentStock((warehouse.getCurrentStock() != null ? warehouse.getCurrentStock() : 0) + quantity);
        warehouseRepository.save(warehouse);

        WarehouseInventory saved = inventoryRepository.save(inventory);
        return mapToDto(saved);
    }

    // Cập nhật hàng tồn trong kho
    public WarehouseInventoryItemDto updateInventoryItem(UUID inventoryId, Integer quantity, String unit, String location) {
        WarehouseInventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new EntityNotFoundException("Item không tồn tại: " + inventoryId));

        int quantityDiff = 0;
        if (quantity != null) {
            quantityDiff = quantity - inventory.getQuantity();
            inventory.setQuantity(quantity);
        }
        if (unit != null) inventory.setUnit(unit);
        if (location != null) inventory.setLocation(location);

        // Cập nhật currentStock của warehouse
        Warehouse warehouse = inventory.getWarehouse();
        warehouse.setCurrentStock((warehouse.getCurrentStock() != null ? warehouse.getCurrentStock() : 0) + quantityDiff);
        warehouseRepository.save(warehouse);

        return mapToDto(inventoryRepository.save(inventory));
    }

    // Xóa hàng trong kho
    public void deleteInventoryItem(UUID inventoryId) {
        WarehouseInventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new EntityNotFoundException("Item không tồn tại: " + inventoryId));

        // Cập nhật currentStock của warehouse
        Warehouse warehouse = inventory.getWarehouse();
        warehouse.setCurrentStock((warehouse.getCurrentStock() != null ? warehouse.getCurrentStock() : 0) - inventory.getQuantity());
        warehouseRepository.save(warehouse);

        inventoryRepository.delete(inventory);
    }
    public void deleteByProductAndWarehouse(UUID productId, UUID warehouseId) {
        WarehouseInventory item = inventoryRepository
                .findByProduct_IdAndWarehouse_Id(productId, warehouseId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kiện trong kho"));

        deleteInventoryItem(item.getId());
    }

    // Mapper entity → DTO
    private WarehouseInventoryItemDto mapToDto(WarehouseInventory item) {
        return WarehouseInventoryItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .category(item.getProduct().getCategory() != null ? item.getProduct().getCategory().getName() : "")
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .location(item.getLocation())
                .lastUpdated(item.getUpdatedAt())
                .build();
    }
}


