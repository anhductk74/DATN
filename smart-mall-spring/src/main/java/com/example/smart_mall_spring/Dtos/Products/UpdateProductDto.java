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
public class UpdateProductDto {
    private UUID categoryId;
    private String name;
    private String description;
    private String brand;
    private Status status;
    
    // Optional: Update variants (if not provided, existing variants remain)
    private List<UpdateProductVariantDto> variants;
}