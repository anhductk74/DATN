package com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Data
public class OrderReturnRequestDto {
    private UUID orderId;
    private String reason;
    private List<MultipartFile> images; // danh sách ảnh người dùng upload
}