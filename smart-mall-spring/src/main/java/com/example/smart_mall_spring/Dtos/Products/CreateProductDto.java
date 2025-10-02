package com.example.smart_mall_spring.Dtos.Products;

import com.example.smart_mall_spring.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductDto {
    private UUID categoryId;
    private UUID shopId;
    private String name;
    private String description;
    private String brand;
    
    @Builder.Default
    private Status status = Status.ACTIVE; // Default status
    
    // Product variants (at least one variant required)
    private List<CreateProductVariantDto> variants;
}