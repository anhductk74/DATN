package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Products.CreateReviewDto;
import com.example.smart_mall_spring.Dtos.Products.ReviewResponseDto;
import com.example.smart_mall_spring.Dtos.Products.UpdateReviewDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Products.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Review", description = "Product review management APIs")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create review", description = "Create a new review for a product")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> createReview(@Valid @RequestBody CreateReviewDto createReviewDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID userId = userDetails.getUser().getId();

        ReviewResponseDto review = reviewService.createReview(userId, createReviewDto);
        return ResponseEntity.ok(ApiResponse.success("Review created successfully", review));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Update review", description = "Update an existing review")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> updateReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody UpdateReviewDto updateReviewDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID userId = userDetails.getUser().getId();

        updateReviewDto.setReviewId(reviewId);
        ReviewResponseDto review = reviewService.updateReview(userId, updateReviewDto);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", review));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Delete review", description = "Delete a review")
    public ResponseEntity<ApiResponse<String>> deleteReview(@PathVariable UUID reviewId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID userId = userDetails.getUser().getId();

        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews by product", description = "Get all reviews for a specific product with pagination")
    public ResponseEntity<ApiResponse<Page<ReviewResponseDto>>> getReviewsByProduct(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponseDto> reviews = reviewService.getReviewsByProductId(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }

    @GetMapping("/user/my-reviews")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get user reviews", description = "Get all reviews by the current user with pagination")
    public ResponseEntity<ApiResponse<Page<ReviewResponseDto>>> getUserReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID userId = userDetails.getUser().getId();

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponseDto> reviews = reviewService.getReviewsByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("User reviews retrieved successfully", reviews));
    }

    @GetMapping("/{reviewId}")
    @Operation(summary = "Get review by ID", description = "Get a specific review by its ID")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> getReviewById(@PathVariable UUID reviewId) {
        ReviewResponseDto review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", review));
    }

    @GetMapping("/product/{productId}/statistics")
    @Operation(summary = "Get product review statistics", description = "Get review statistics for a product")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductReviewStatistics(@PathVariable UUID productId) {
        Double averageRating = reviewService.getAverageRatingByProductId(productId);
        Long reviewCount = reviewService.getReviewCountByProductId(productId);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("averageRating", averageRating != null ? averageRating : 0.0);
        statistics.put("reviewCount", reviewCount);
        
        return ResponseEntity.ok(ApiResponse.success("Review statistics retrieved successfully", statistics));
    }
}