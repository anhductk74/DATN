package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderUpdateDto;
import com.example.smart_mall_spring.Services.Logistics.ProofImageService;
import com.example.smart_mall_spring.Services.Logistics.ShipperDashboardService;
import com.example.smart_mall_spring.Services.Logistics.SubShipmentOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipper/sub-orders")
@RequiredArgsConstructor
public class ShipperSubOrderController {

    private final SubShipmentOrderService subShipmentOrderService;
    private final ProofImageService proofImageService;
    private final ShipperDashboardService  shipperDashboardService;


    //  Danh sách sub orders theo shipper
    @GetMapping
    public ResponseEntity<?> getSubOrdersByShipper(@RequestParam UUID shipperId) {
        return ResponseEntity.ok(subShipmentOrderService.getDetailByShipper(shipperId));
    }


    //  Lịch sử giao (status = DELIVERED)
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam UUID shipperId
    ) {
        return ResponseEntity.ok(
                subShipmentOrderService.getHistory(shipperId)
        );
    }
    //   Tìm đơn theo mã vận đơn cha
    @GetMapping("/{trackingCode}")
    public SubShipmentOrderResponseDto getByTrackingCode(@PathVariable String trackingCode) {
        return subShipmentOrderService.findByTrackingCode(trackingCode);
    }

    //   Shipper xác nhận lấy hàng
    @PostMapping("/{trackingCode}/pickup")
    public SubShipmentOrderResponseDto confirmPickup(@PathVariable String trackingCode) {
        return subShipmentOrderService.confirmPickupByCode(trackingCode);
    }

    //   Xác nhận vận chuyển liên kho
    @PostMapping("/{trackingCode}/transit")
    public SubShipmentOrderResponseDto confirmTransit(@PathVariable String trackingCode) {
        return subShipmentOrderService.confirmTransitByCode(trackingCode);
    }

    //   Xác nhận hoàn thành chặng
    @PostMapping("/{trackingCode}/deliver")
    public SubShipmentOrderResponseDto confirmDelivery(@PathVariable String trackingCode) {
        return subShipmentOrderService.confirmDeliveryByCode(trackingCode);
    }

    @PostMapping("/{trackingCode}/proof")
    public ResponseEntity<?> uploadProof(
            @PathVariable String trackingCode,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                proofImageService.uploadProofImage(trackingCode, file)
        );
    }

    @GetMapping("/{trackingCode}/proof")
    public ResponseEntity<?> getProofImages(@PathVariable String trackingCode) {
        return ResponseEntity.ok(
                proofImageService.getProofImages(trackingCode)
        );
    }
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestParam UUID shipperId) {
        return ResponseEntity.ok(shipperDashboardService.getDashboard(shipperId));
    }
}
