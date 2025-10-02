package com.example.smart_mall_spring.Dtos.Categories;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCategoryDto {
    private String name;
    private String description;
    private UUID parentId; // ID của category cha (null nếu là root category)
}