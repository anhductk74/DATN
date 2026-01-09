package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Dtos.Products.Review.MonthlyReviewStats;
import com.example.smart_mall_spring.Entities.Products.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID>, JpaSpecificationExecutor<Review> {

    // 1. Lấy trang các review của một product, sort/ filter phía Pageable
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId")
    Page<Review> findByProductId(@Param("productId") UUID productId, Pageable pageable);

    // 2. Lấy review kèm media (fetch join) để tránh N+1
    @Query("SELECT DISTINCT r FROM Review r LEFT JOIN FETCH r.mediaList m WHERE r.product.id = :productId")
    List<Review> findByProductIdWithMedia(@Param("productId") UUID productId);


    // 3. Lấy review của 1 user
    List<Review> findByUserId(UUID userId);

    // 4. Lấy review liên quan tới order (để kiểm tra người đã mua)
    Optional<Review> findByOrderId(UUID orderId);

    // 5. Tính rating trung bình của product
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") UUID productId);

    // 6. Đếm tổng review của product
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long countByProductId(@Param("productId") UUID productId);

    // 7. Đếm số review theo từng rating (1..5) cho product
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.rating = :rating")
    Long countByProductIdAndRating(@Param("productId") UUID productId, @Param("rating") Integer rating);

    // 8. Lấy review chi tiết (kèm media + reply) bằng id (fetch join)
    @Query("SELECT r FROM Review r " +
            "LEFT JOIN FETCH r.mediaList m " +
            "LEFT JOIN FETCH r.product p " +
            "WHERE r.id = :reviewId")
    Optional<Review> findByIdWithMedia(@Param("reviewId") UUID reviewId);

    // 9. Kiểm tra user đã review product (dùng khi muốn cấm review trùng)
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);

    // 10. Xoá review theo id (thường JpaRepository đã có deleteById, nhưng đưa mẫu @Modifying nếu cần query custom)
    @Modifying
    @Query("DELETE FROM Review r WHERE r.id = :reviewId")
    void deleteByIdCustom(@Param("reviewId") UUID reviewId);

    Optional<Review> findByUserIdAndProductId(UUID userId, UUID productId);
    boolean existsByUserIdAndProductIdAndOrderId(UUID userId, UUID productId, UUID orderId);

    @Query("""
    SELECT r FROM Review r
    JOIN r.product p
    WHERE p.shop.id = :shopId
    AND (:rating IS NULL OR r.rating = :rating)
    AND (:productId IS NULL OR p.id = :productId)
    AND (:hasReply IS NULL OR
        (:hasReply = TRUE AND EXISTS (SELECT 1 FROM ReviewReply rr WHERE rr.review.id = r.id))
        OR (:hasReply = FALSE AND NOT EXISTS (SELECT 1 FROM ReviewReply rr WHERE rr.review.id = r.id))
    )
""")
    Page<Review> findByShopWithFilters(
            @Param("shopId") UUID shopId,
            @Param("rating") Integer rating,
            @Param("hasReply") Boolean hasReply,
            @Param("productId") UUID productId,
            Pageable pageable
    );
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.shop.id = :shopId")
    Long countByShopId(@Param("shopId") UUID shopId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.shop.id = :shopId")
    Double getAverageRatingByShopId(@Param("shopId") UUID shopId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.shop.id = :shopId AND EXISTS (SELECT 1 FROM ReviewReply rr WHERE rr.review.id = r.id)")
    Long countByShopIdWithReply(@Param("shopId") UUID shopId);

    Optional<Review> findTopByProductIdOrderByReviewedAtDesc(UUID productId);

    @Query(value = """
    SELECT
        DATE_FORMAT(r.reviewed_at, '%Y-%m') AS yearMonth,
        COUNT(r.id) AS totalReviews,
        AVG(r.rating) AS averageRating
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE p.shop_id = :shopId
    GROUP BY DATE_FORMAT(r.reviewed_at, '%Y-%m')
    ORDER BY DATE_FORMAT(r.reviewed_at, '%Y-%m')
""", nativeQuery = true)
    List<Object[]> getMonthlyReviewTrendByShop(@Param("shopId") UUID shopId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.shop.id = :shopId AND r.rating = :rating")
    Long countByShopIdAndRating(@Param("shopId") UUID shopId, @Param("rating") Integer rating);
    
    // === Dashboard Queries ===
    
    // Get average rating by shop
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.shop.id = :shopId")
    Double getAverageRatingByShop(@Param("shopId") UUID shopId);
    
    // Get recent reviews
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findTopByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
    
    default List<Review> findTopByOrderByCreatedAtDesc(int limit) {
        return findTopByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(0, limit));
    }

}