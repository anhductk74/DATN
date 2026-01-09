package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    
    // Tìm tất cả shop của một user
    List<Shop> findByOwnerId(UUID ownerId);
    
    // Tìm shop theo tên (tìm kiếm tương đối)
    @Query("SELECT s FROM Shop s WHERE s.name LIKE %:name%")
    List<Shop> findByNameContaining(@Param("name") String name);
    
    // Tìm shop theo tên và owner
    List<Shop> findByOwnerIdAndNameContaining(UUID ownerId, String name);
    
    // Đếm số shop của một user
    long countByOwnerId(UUID ownerId);
    
    // Tăng view count cho shop
    @Modifying
    @Query("UPDATE Shop s SET s.viewCount = s.viewCount + 1 WHERE s.id = :shopId")
    void incrementViewCount(@Param("shopId") UUID shopId);
    
    // === Dashboard Queries ===
    
    // Count shops created after date
    @Query("SELECT COUNT(s) FROM Shop s WHERE s.createdAt >= :date")
    Long countByCreatedAtAfter(@Param("date") java.time.LocalDateTime date);
    
    // Get top shops by revenue (for dashboard)
    @Query(value = "SELECT DISTINCT s.* FROM shops s " +
           "JOIN orders o ON o.shop_id = s.id " +
           "WHERE o.status = 'DELIVERED' AND o.created_at BETWEEN ?1 AND ?2 " +
           "GROUP BY s.id " +
           "ORDER BY SUM(o.total_amount) DESC " +
           "LIMIT ?3", nativeQuery = true)
    List<Shop> findTopShopsByRevenue(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, int limit);
    
    // Get recent shops
    @Query("SELECT s FROM Shop s ORDER BY s.createdAt DESC")
    List<Shop> findTopByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
    
    default List<Shop> findTopByOrderByCreatedAtDesc(int limit) {
        return findTopByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(0, limit));
    }
}
