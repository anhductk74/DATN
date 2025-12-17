package com.example.smart_mall_spring.Dtos.Wishlists;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToWishlistDto {
    private UUID productId;
    private String note; // Optional note about the product
}
