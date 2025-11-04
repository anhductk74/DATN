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
}
