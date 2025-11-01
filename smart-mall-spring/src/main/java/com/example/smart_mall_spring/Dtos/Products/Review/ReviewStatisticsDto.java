package com.example.smart_mall_spring.Dtos.Products.Review;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatisticsDto {
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingCounts;
}