package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipperTransaction.ShipperTransactionRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipperTransaction.ShipperTransactionResponseDto;
import com.example.smart_mall_spring.Services.Logistics.ShipperTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipper-transactions")
@RequiredArgsConstructor
public class ShipperTransactionController {

    private final ShipperTransactionService shipperTransactionService;

    @GetMapping
    public ResponseEntity<List<ShipperTransactionResponseDto>> getAll() {
        return ResponseEntity.ok(shipperTransactionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipperTransactionResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipperTransactionService.getById(id));
    }

    @GetMapping("/shipper/{shipperId}")
    public ResponseEntity<List<ShipperTransactionResponseDto>> getByShipper(@PathVariable UUID shipperId) {
        return ResponseEntity.ok(shipperTransactionService.getByShipper(shipperId));
    }

    @GetMapping("/shipment/{shipmentOrderId}")
    public ResponseEntity<List<ShipperTransactionResponseDto>> getByShipmentOrder(@PathVariable UUID shipmentOrderId) {
        return ResponseEntity.ok(shipperTransactionService.getByShipmentOrder(shipmentOrderId));
    }

    @PostMapping
    public ResponseEntity<ShipperTransactionResponseDto> create(@RequestBody ShipperTransactionRequestDto dto) {
        return ResponseEntity.ok(shipperTransactionService.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        shipperTransactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/shipper/{shipperId}/total-collected")
    public BigDecimal getTotalCollected(@PathVariable UUID shipperId) {
        return shipperTransactionService.getTotalCollected(shipperId);
    }
    @GetMapping("/shipper/{shipperId}/total-paid")
    public BigDecimal getTotalPaid(@PathVariable UUID shipperId) {
        return shipperTransactionService.getTotalPaid(shipperId);
    }
    @GetMapping("/shipper/{shipperId}/revenue-summary")
    public Map<String, BigDecimal> getRevenueSummary(@PathVariable UUID shipperId) {
        return shipperTransactionService.getRevenueSummary(shipperId);
    }
}