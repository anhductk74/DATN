package com.example.smart_mall_spring.Dtos.FlashSale;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFlashSaleDto {
    
    @Size(min = 3, max = 200, message = "Name must be between 3 and 200 characters")
    private String name;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private String bannerImage;
    
    @Min(value = 0, message = "Display priority must be non-negative")
    private Integer displayPriority;
    
    private List<UpdateFlashSaleItemDto> items;
    
    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }
}
