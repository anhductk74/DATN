package com.example.smart_mall_spring.Dtos.Orders.OrderItem;


import com.example.smart_mall_spring.Dtos.Products.ProductVariantDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {

    private UUID id;                  // ID của order item
    private UUID orderId;             // Liên kết với Order
    private ProductVariantDto variant; // Thông tin chi tiết variant
    private String productName;       // Tên sản phẩm
    private String productImage;      // Ảnh sản phẩm
    private Integer quantity;         // Số lượng
    private Double price;             // Giá đơn vị
    private Double subtotal;          // Giá * số lượng
    private LocalDateTime createdAt;  // Thời gian tạo
    private LocalDateTime updatedAt;  // Thời gian cập nhật
}
