package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {
    
    // Tìm wishlist item theo user và product
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId AND w.product.id = :productId")
    Optional<Wishlist> findByUserIdAndProductId(
        @Param("userId") UUID userId, 
        @Param("productId") UUID productId
    );
    
    // Kiểm tra xem product đã có trong wishlist của user chưa
    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Wishlist w WHERE w.user.id = :userId AND w.product.id = :productId")
    boolean existsByUserIdAndProductId(
        @Param("userId") UUID userId, 
        @Param("productId") UUID productId
    );
    
    // Lấy tất cả wishlist của user
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId ORDER BY w.createdAt DESC")
    List<Wishlist> findByUserId(@Param("userId") UUID userId);
    
    // Lấy tất cả wishlist của user với phân trang
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId ORDER BY w.createdAt DESC")
    Page<Wishlist> findByUserIdWithPagination(
        @Param("userId") UUID userId, 
        Pageable pageable
    );
    
    // Đếm số lượng wishlist của user
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);
    
    // Xóa wishlist theo user và product
    @Query("DELETE FROM Wishlist w WHERE w.user.id = :userId AND w.product.id = :productId")
    void deleteByUserIdAndProductId(
        @Param("userId") UUID userId, 
        @Param("productId") UUID productId
    );
    
    // Xóa tất cả wishlist của user
    @Query("DELETE FROM Wishlist w WHERE w.user.id = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);
}
