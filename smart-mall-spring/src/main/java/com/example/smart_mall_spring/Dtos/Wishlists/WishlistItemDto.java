package com.example.smart_mall_spring.Dtos.Wishlists;

import com.example.smart_mall_spring.Dtos.Products.ProductResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemDto {
    private UUID wishlistId;
    private ProductResponseDto product;
    private String note;
    private LocalDateTime addedAt; // createdAt
}
