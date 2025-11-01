package com.example.smart_mall_spring.Repositories;


import com.example.smart_mall_spring.Entities.Products.ReviewReply;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, UUID> {

    // 1. Lấy reply theo review id (một review thường chỉ có 1 reply của shop)
    Optional<ReviewReply> findByReviewId(UUID reviewId);

    // 2. Lấy replies theo shop (paging, ví dụ để trang quản lý shop)
    @Query("SELECT rr FROM ReviewReply rr WHERE rr.shop.id = :shopId ORDER BY rr.repliedAt DESC")
    List<ReviewReply> findByShopId(@Param("shopId") UUID shopId, Pageable pageable);

    // 3. Kiểm tra shop đã trả lời review chưa
    boolean existsByReviewIdAndShopId(UUID reviewId, UUID shopId);

    // 4. Xóa reply theo review id (nếu cần)
    @Modifying
    @Query("DELETE FROM ReviewReply rr WHERE rr.review.id = :reviewId")
    void deleteByReviewId(@Param("reviewId") UUID reviewId);

    Optional<ReviewReply> findByReviewIdAndShopId(UUID reviewId, UUID shopId);

}