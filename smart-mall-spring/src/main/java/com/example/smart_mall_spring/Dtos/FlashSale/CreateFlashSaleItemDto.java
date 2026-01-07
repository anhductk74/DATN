package com.example.smart_mall_spring.Dtos.FlashSale;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFlashSaleItemDto {
    
    @NotNull(message = "Product ID is required")
    private UUID productId;
    
    private UUID productVariantId;
    
    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Original price must be greater than 0")
    private Double originalPrice;
    
    @NotNull(message = "Flash sale price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Flash sale price must be greater than 0")
    private Double flashSalePrice;
    
    @NotNull(message = "Total quantity is required")
    @Min(value = 1, message = "Total quantity must be at least 1")
    private Integer totalQuantity;
    
    @Builder.Default
    @Min(value = 1, message = "Max quantity per user must be at least 1")
    @Max(value = 100, message = "Max quantity per user must not exceed 100")
    private Integer maxQuantityPerUser = 5;
    
    @AssertTrue(message = "Flash sale price must be less than original price")
    public boolean isFlashSalePriceLessThanOriginal() {
        if (originalPrice == null || flashSalePrice == null) {
            return true;
        }
        return flashSalePrice < originalPrice;
    }
}
