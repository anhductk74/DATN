package com.example.smart_mall_spring.Dtos.Products.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDto {
    private String userId;
    private String productId;
    private String orderId;

    private Integer rating;
    private String comment;

    // Danh sách URL Cloudinary (đã upload từ FE)
    private List<String> imageUrls;
    private List<String> videoUrls;
}