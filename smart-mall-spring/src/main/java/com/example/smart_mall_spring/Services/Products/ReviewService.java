package com.example.smart_mall_spring.Services.Products;

import com.example.smart_mall_spring.Dtos.Products.CreateReviewDto;
import com.example.smart_mall_spring.Dtos.Products.ReviewResponseDto;
import com.example.smart_mall_spring.Dtos.Products.UpdateReviewDto;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Entities.Products.Review;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Exception.ResourceNotFoundException;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import com.example.smart_mall_spring.Repositories.ReviewRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public ReviewResponseDto createReview(UUID userId, CreateReviewDto createReviewDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Product product = productRepository.findById(createReviewDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check if user has already reviewed this product
        if (reviewRepository.existsByUserIdAndProductId(userId, createReviewDto.getProductId())) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(createReviewDto.getRating());
        review.setComment(createReviewDto.getComment());
        
        Review savedReview = reviewRepository.save(review);
        return convertToReviewResponseDto(savedReview);
    }
    
    public ReviewResponseDto updateReview(UUID userId, UpdateReviewDto updateReviewDto) {
        Review review = reviewRepository.findById(updateReviewDto.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        // Verify that the review belongs to the user
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to review");
        }
        
        if (updateReviewDto.getRating() != null) {
            review.setRating(updateReviewDto.getRating());
        }
        if (updateReviewDto.getComment() != null) {
            review.setComment(updateReviewDto.getComment());
        }
        
        Review savedReview = reviewRepository.save(review);
        return convertToReviewResponseDto(savedReview);
    }
    
    public void deleteReview(UUID userId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        // Verify that the review belongs to the user
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to review");
        }
        
        reviewRepository.delete(review);
    }
    
    public Page<ReviewResponseDto> getReviewsByProductId(UUID productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return reviews.map(this::convertToReviewResponseDto);
    }
    
    public Page<ReviewResponseDto> getReviewsByUserId(UUID userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return reviews.map(this::convertToReviewResponseDto);
    }
    
    public ReviewResponseDto getReviewById(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return convertToReviewResponseDto(review);
    }
    
    public Double getAverageRatingByProductId(UUID productId) {
        return reviewRepository.findAverageRatingByProductId(productId);
    }
    
    public Long getReviewCountByProductId(UUID productId) {
        return reviewRepository.countByProductId(productId);
    }
    
    private ReviewResponseDto convertToReviewResponseDto(Review review) {
        return ReviewResponseDto.builder()
                .id(review.getId())
                .user(convertToUserInfoDto(review.getUser()))
                .product(convertToProductResponseDto(review.getProduct()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
    
    // These conversion methods would need to be implemented based on your existing DTOs
    private com.example.smart_mall_spring.Dtos.Auth.UserInfoDto convertToUserInfoDto(User user) {
        // Implementation depends on your UserInfoDto structure
        return com.example.smart_mall_spring.Dtos.Auth.UserInfoDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getProfile() != null ? user.getProfile().getFullName() : null)
                .avatar(user.getProfile() != null ? user.getProfile().getAvatar() : null)
                .build();
    }
    
    private com.example.smart_mall_spring.Dtos.Products.ProductResponseDto convertToProductResponseDto(Product product) {
        // Implementation depends on your ProductResponseDto structure
        return com.example.smart_mall_spring.Dtos.Products.ProductResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .build();
    }
}