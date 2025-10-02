package com.example.smart_mall_spring.Dtos.Products;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponseDto {
    private UUID id;
    private CategoryResponseDto category;
    private ShopResponseDto shop;
    private String name;
    private String description;
    private String brand;
    private List<String> images;
    private Status status;
    private List<ProductVariantResponseDto> variants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double averageRating;
    private Integer reviewCount;
}