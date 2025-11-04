package com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderReturnResponseDto {
    private UUID id;
    private UUID orderId;
    private UUID userId;
    private String userName;
    private String reason;
    private String status;
    private LocalDateTime requestDate;
    private LocalDateTime processedDate;
    private List<String> imageUrls; // danh sách URL ảnh
}
