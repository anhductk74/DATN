package com.example.smart_mall_spring.Repositories;


import com.example.smart_mall_spring.Entities.Products.ReviewMedia;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewMediaRepository extends JpaRepository<ReviewMedia, UUID> {

    // 1. Lấy tất cả media theo review id
    List<ReviewMedia> findByReviewId(UUID reviewId);

    // 2. Xóa tất cả media theo review id (dùng khi xóa review muốn xóa media kèm)
    @Transactional
    @Modifying
    @Query("DELETE FROM ReviewMedia m WHERE m.review.id = :reviewId")
    void deleteByReviewId(UUID reviewId);

    // 3. Kiểm tra media có tồn tại theo URL (tránh lưu trùng)
    boolean existsByMediaUrl(String mediaUrl);
}