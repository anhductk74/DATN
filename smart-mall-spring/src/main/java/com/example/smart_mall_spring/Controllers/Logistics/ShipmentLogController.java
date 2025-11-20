package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog.ShipmentLogRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog.ShipmentLogResponseDto;
import com.example.smart_mall_spring.Services.Logistics.ShipmentLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipment-logs")
@RequiredArgsConstructor
public class ShipmentLogController {

    private final ShipmentLogService shipmentLogService;

    @GetMapping
    public ResponseEntity<List<ShipmentLogResponseDto>> getAllLogs() {
        return ResponseEntity.ok(shipmentLogService.getAllLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentLogResponseDto> getLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipmentLogService.getLogById(id));
    }

    @GetMapping("/order/{shipmentOrderId}")
    public ResponseEntity<List<ShipmentLogResponseDto>> getLogsByShipmentOrder(@PathVariable UUID shipmentOrderId) {
        return ResponseEntity.ok(shipmentLogService.getLogsByShipmentOrder(shipmentOrderId));
    }

    @PostMapping
    public ResponseEntity<ShipmentLogResponseDto> createLog(@RequestBody ShipmentLogRequestDto dto) {
        return ResponseEntity.ok(shipmentLogService.createLog(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable UUID id) {
        shipmentLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}