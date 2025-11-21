package com.example.smart_mall_spring.Controllers.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderUpdateDto;
import com.example.smart_mall_spring.Services.Logistics.SubShipmentOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/sub-shipment-orders")
@RequiredArgsConstructor
public class SubShipmentOrderController {

    private final SubShipmentOrderService subShipmentOrderService;

    @GetMapping
    public ResponseEntity<List<SubShipmentOrderResponseDto>> getAll() {
        return ResponseEntity.ok(subShipmentOrderService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubShipmentOrderResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(subShipmentOrderService.getById(id));
    }

    @GetMapping("/shipment/{shipmentOrderId}")
    public ResponseEntity<List<SubShipmentOrderResponseDto>> getByShipmentOrder(@PathVariable UUID shipmentOrderId) {
        return ResponseEntity.ok(subShipmentOrderService.getByShipmentOrder(shipmentOrderId));
    }

    @PostMapping
    public ResponseEntity<SubShipmentOrderResponseDto> create(@RequestBody SubShipmentOrderRequestDto dto) {
        return ResponseEntity.ok(subShipmentOrderService.create(dto));
    }

        @PutMapping("/{id}")
        public ResponseEntity<SubShipmentOrderResponseDto> update(@PathVariable UUID id, @RequestBody SubShipmentOrderUpdateDto dto) {
            return ResponseEntity.ok(subShipmentOrderService.update(id, dto));
        }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        subShipmentOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}