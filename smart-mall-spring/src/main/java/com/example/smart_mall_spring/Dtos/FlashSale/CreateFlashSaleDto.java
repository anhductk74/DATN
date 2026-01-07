package com.example.smart_mall_spring.Dtos.FlashSale;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFlashSaleDto {
    
    @NotBlank(message = "Flash sale name is required")
    @Size(min = 3, max = 200, message = "Name must be between 3 and 200 characters")
    private String name;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    private String bannerImage;
    
    @NotNull(message = "Shop ID is required")
    private UUID shopId;
    
    @Builder.Default
    @Min(value = 0, message = "Display priority must be non-negative")
    private Integer displayPriority = 0;
    
    @NotEmpty(message = "At least one flash sale item is required")
    private List<CreateFlashSaleItemDto> items;
    
    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) {
            return true; // Let @NotNull handle null cases
        }
        return endTime.isAfter(startTime);
    }
}
