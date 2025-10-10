package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);
    Page<Review> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
    Long countByProductId(UUID productId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") UUID productId);
}