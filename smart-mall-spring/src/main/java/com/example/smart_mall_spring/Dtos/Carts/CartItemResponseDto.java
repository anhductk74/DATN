package com.example.smart_mall_spring.Dtos.Carts;

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
public class CartItemResponseDto {
    private UUID id;
    private ProductVariantDto variant;
    private String productName;
    private String productShopId;
    private String productImage;
    private Integer quantity;
    private Double subtotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}