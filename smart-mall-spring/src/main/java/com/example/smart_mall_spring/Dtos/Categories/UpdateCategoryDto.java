package com.example.smart_mall_spring.Dtos.Categories;

import com.example.smart_mall_spring.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCategoryDto {
    private String name;
    private String description;
    private UUID parentId;
    private Status status; // ACTIVE or INACTIVE
}