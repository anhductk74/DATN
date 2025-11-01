package com.example.smart_mall_spring.Dtos.Products.Review;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyReviewStats {
    // Mình dùng yearMonth dạng "YYYY-MM" để dễ hiển thị/plot
    private String yearMonth;
    private long totalReviews;
    private double averageRating;
}