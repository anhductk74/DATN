package com.example.smart_mall_spring.Controllers;


import com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest.OrderReturnRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest.OrderReturnResponseDto;
import com.example.smart_mall_spring.Enum.ReturnStatus;
import com.example.smart_mall_spring.Services.Order.OrderReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders/return-request")
@RequiredArgsConstructor
public class OrderReturnRequestController {

    private final OrderReturnRequestService returnRequestService;

    /**
     *  User gửi yêu cầu hoàn trả
     */
    @PostMapping
    public ResponseEntity<OrderReturnResponseDto> createReturnRequest(
            @RequestParam UUID orderId,
            @RequestParam UUID userId,
            @RequestParam String reason,
            @RequestParam(required = false) List<MultipartFile> images) {

        OrderReturnRequestDto dto = new OrderReturnRequestDto();
        dto.setOrderId(orderId);
        dto.setReason(reason);
        dto.setImages(images);

        OrderReturnResponseDto response = returnRequestService.createReturnRequest(dto, userId);
        return ResponseEntity.ok(response);
    }

    /**
     *  Lấy danh sách yêu cầu hoàn trả theo user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderReturnResponseDto>> getReturnRequestsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(returnRequestService.getReturnRequestsByUser(userId));
    }

    /**
     *  Lấy danh sách yêu cầu hoàn trả theo order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderReturnResponseDto>> getReturnRequestsByOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(returnRequestService.getReturnRequestsByOrder(orderId));
    }

    /**
     *  Admin cập nhật trạng thái hoàn trả (APPROVED, REJECTED, COMPLETED, ...)
     */
    @PutMapping("/{requestId}/status")
    public ResponseEntity<OrderReturnResponseDto> updateReturnStatus(
            @PathVariable UUID requestId,
            @RequestParam ReturnStatus status) {
        return ResponseEntity.ok(returnRequestService.updateReturnStatus(requestId, status));
    }
}