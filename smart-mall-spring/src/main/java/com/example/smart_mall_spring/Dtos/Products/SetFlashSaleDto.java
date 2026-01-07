package com.example.smart_mall_spring.Dtos.Products;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetFlashSaleDto {
    
    @NotNull(message = "Flash sale price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Flash sale price must be greater than 0")
    private Double flashSalePrice;
    
    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @Min(value = 1, message = "Flash sale quantity must be at least 1")
    private Integer flashSaleQuantity;
    
    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }
}
