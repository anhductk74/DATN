package com.example.smart_mall_spring.Dtos.Products.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewMediaResponseDto {
    private String id;
    private String mediaUrl;
    private String mediaType; // IMAGE hoặc VIDEO
}