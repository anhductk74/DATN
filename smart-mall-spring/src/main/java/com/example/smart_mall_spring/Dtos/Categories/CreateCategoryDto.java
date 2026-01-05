package com.example.smart_mall_spring.Dtos.Categories;

import com.example.smart_mall_spring.Enum.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating category - supports both JSON and form-data
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCategoryDto {
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    // Image URL (used when submitting JSON or when image is already uploaded)
    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String image;
    
    private UUID parentId; // ID của category cha (null nếu là root category)
    private Status status; // ACTIVE or INACTIVE (default: ACTIVE)
}