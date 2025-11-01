package com.example.smart_mall_spring.Dtos.Products.Review;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShopReviewStatisticsDto {
    private Long totalReviews;
    private Double averageRating;
    private Map<Integer, Long> ratingCounts;
    private Long repliedCount;
    private Long pendingReplyCount;
    private List<MonthlyReviewStats> monthlyTrend;
}