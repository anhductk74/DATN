package com.example.smart_mall_spring.Dtos.Categories;

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
public class CategoryResponseDto {
    private UUID id;
    private String name;
    private String description;
    private CategoryResponseDto parent;
    private List<CategoryResponseDto> subCategories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
