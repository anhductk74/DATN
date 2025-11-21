package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperDeliveryStatisticsResponse;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperStatisticsResponse;
import com.example.smart_mall_spring.Services.Logistics.ShipperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shippers")
@RequiredArgsConstructor
public class ShipperController {

    private final ShipperService shipperService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllShippers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(shipperService.getAllShippers(search, status, region, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipperResponseDto> getShipperById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipperService.getShipperById(id));
    }

    @PostMapping
    public ResponseEntity<ShipperResponseDto> createShipper(@RequestBody ShipperRequestDto dto) {
        return ResponseEntity.ok(shipperService.createShipper(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShipperResponseDto> updateShipper(@PathVariable UUID id, @RequestBody ShipperRequestDto dto) {
        return ResponseEntity.ok(shipperService.updateShipper(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipper(@PathVariable UUID id) {
        shipperService.deleteShipper(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/statistics")
    public ResponseEntity<ShipperStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(shipperService.getShipperStatistics());
    }
    @GetMapping("/{id}/delivery-statistics")
    public ResponseEntity<ShipperDeliveryStatisticsResponse> getDeliveryStats(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(shipperService.getShipperDeliveryStatistics(id));
    }
}