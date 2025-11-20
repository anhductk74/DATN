package com.example.smart_mall_spring.Controllers.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder.ShipmentOrderRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder.ShipmentOrderResponseDto;
import com.example.smart_mall_spring.Dtos.Products.ProductResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Services.Logistics.GhtkService;
import com.example.smart_mall_spring.Services.Logistics.ShipmentOrderService;
import com.example.smart_mall_spring.Services.Products.ProductService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/ghtk")
@RequiredArgsConstructor
public class GhtkController {

    private final GhtkService ghtkService;
    private final ShipmentOrderService shipmentOrderService;


    @Data
    public static class ProductGhtk {
        private String name;
        private double weight;
        private int quantity;
        private String productCode;
    }

    // ==================== TEST TẠO ĐƠN GHTK ====================

    @PostMapping("/register/{shipmentOrderId}")
    public ResponseEntity<Map<String, Object>> registerOrder(@PathVariable UUID shipmentOrderId) {
        ShipmentOrder shipmentOrder = shipmentOrderService.getEntityById(shipmentOrderId);
        Map<String, Object> result = ghtkService.registerOrderWithProducts(shipmentOrder);
        return ResponseEntity.ok(result);
    }

    // Hủy đơn
    @PostMapping("/cancel/{trackingCode}")
    public ResponseEntity<String> cancelOrder(@PathVariable String trackingCode) {
        ghtkService.cancelOrder(trackingCode);
        return ResponseEntity.ok("Đơn hàng đã hủy");
    }

    // In nhãn
    @GetMapping("/print/{trackingCode}")
    public ResponseEntity<byte[]> printLabel(@PathVariable String trackingCode) {
        byte[] pdf = ghtkService.printLabel(trackingCode);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("inline")
                .filename(trackingCode + ".pdf")
                .build());

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    // Cập nhật trạng thái
    @PostMapping("/update-status/{trackingCode}")
    public ResponseEntity<String> updateStatus(@PathVariable String trackingCode) {
        ShipmentStatus updatedStatus = ghtkService.fetchAndUpdateOrderStatus(trackingCode);
        return ResponseEntity.ok("Cập nhật trạng thái thành công: " + updatedStatus);
    }

    // Tính phí vận chuyển
    @GetMapping("/calculate-fee")
    public ResponseEntity<BigDecimal> calculateFee(
            @RequestParam String pickAddress,
            @RequestParam String deliverAddress,
            @RequestParam BigDecimal weight) {
        BigDecimal fee = ghtkService.calculateShippingFee(pickAddress, deliverAddress, weight);
        return ResponseEntity.ok(fee);
    }
}