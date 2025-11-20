package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder.ShipmentOrderRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder.ShipmentOrderResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Services.Logistics.ShipmentOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipment-orders")
@RequiredArgsConstructor
public class ShipmentOrderController {

    private final ShipmentOrderService shipmentOrderService;

    //  Tạo mới shipment order
    @PostMapping
    public ResponseEntity<ShipmentOrderResponseDto> createShipment(@RequestBody ShipmentOrderRequestDto dto) {
        ShipmentOrder shipmentOrder = shipmentOrderService.createShipmentOrder(dto);
        ShipmentOrderResponseDto responseDto = shipmentOrderService.toResponseDto(shipmentOrder);
        return ResponseEntity.ok(responseDto);
    }

    //  Cập nhật trạng thái
    @PutMapping("/{id}/status")
    public ResponseEntity<ShipmentOrderResponseDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam ShipmentStatus status
    ) {
        return ResponseEntity.ok(shipmentOrderService.updateStatus(id, status));
    }

    //  Lấy tất cả shipment orders
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID shipperId,
            @RequestParam(required = false) UUID warehouseId
    ) {
        Map<String, Object> response = shipmentOrderService.getAllWithFilters(page, size, status, search, shipperId, warehouseId);
        return ResponseEntity.ok(response);
    }

    //  Lấy shipment theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentOrderResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipmentOrderService.getById(id));
    }

    //  Xóa shipment order
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        shipmentOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/assign-shipper")
    public ResponseEntity<ShipmentOrderResponseDto> assignShipper(
            @PathVariable UUID id,
            @RequestParam UUID shipperId
    ) {
        ShipmentOrderResponseDto response = shipmentOrderService.assignShipper(id, shipperId);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}/unassign-shipper")
    public ResponseEntity<ShipmentOrderResponseDto> unassignShipper(@PathVariable UUID id) {
        ShipmentOrderResponseDto response = shipmentOrderService.unassignShipper(id);
        return ResponseEntity.ok(response);
    }
    // -------------------- Check if order has shipment --------------------
    @GetMapping("/order/{orderId}/exists")
    public ResponseEntity<Boolean> checkOrderHasShipment(@PathVariable UUID orderId) {
        boolean exists = shipmentOrderService.checkOrderHasShipment(orderId);
        return ResponseEntity.ok(exists);
    }

    // -------------------- Get shipment by order ID --------------------
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ShipmentOrderResponseDto> getByOrderId(@PathVariable UUID orderId) {
        ShipmentOrderResponseDto shipment = shipmentOrderService.getByOrderId(orderId);
        return ResponseEntity.ok(shipment);
    }

    @GetMapping("/{shipperId}/delivered-orders")
    public List<ShipmentOrder> getDeliveredOrders(
            @PathVariable UUID shipperId,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end
    ) {
        return shipmentOrderService.getDeliveredOrdersOfShipperByDate(
                shipperId,
                start,
                end
        );
    }

    @GetMapping("/{shipperId}/orders")
    public List<ShipmentOrderResponseDto> getAllOrders(@PathVariable UUID shipperId) {
        return shipmentOrderService.getAllOrdersOfShipper(shipperId);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end
    ) {
        return ResponseEntity.ok(
                shipmentOrderService.getDashboardStatistics(start, end)
        );
    }

}
