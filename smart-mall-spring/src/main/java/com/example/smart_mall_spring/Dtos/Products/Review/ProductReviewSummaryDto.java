package com.example.smart_mall_spring.Dtos.Products.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductReviewSummaryDto {
    private String productId;
    private String productName;
    private String productThumbnail; // service gọi product.getThumbnail()
    private Long totalReviews;
    private Double averageRating;
    private Map<Integer, Long> ratingCounts;
    private ReviewResponseDto latestReview; // có thể null
}