package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.FlashSale.FlashSale;
import com.example.smart_mall_spring.Enum.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, UUID> {
    
    // Find non-deleted flash sales
    List<FlashSale> findByIsDeletedFalse();
    
    Page<FlashSale> findByIsDeletedFalse(Pageable pageable);
    
    // Find by ID and not deleted
    Optional<FlashSale> findByIdAndIsDeletedFalse(UUID id);
    
    // Find by shop
    List<FlashSale> findByShopIdAndIsDeletedFalse(UUID shopId);
    
    Page<FlashSale> findByShopIdAndIsDeletedFalse(UUID shopId, Pageable pageable);
    
    // Find by status
    List<FlashSale> findByStatusAndIsDeletedFalse(Status status);
    
    Page<FlashSale> findByStatusAndIsDeletedFalse(Status status, Pageable pageable);
    
    // Find active flash sales (approved, not deleted, within time range)
    @Query("SELECT f FROM FlashSale f WHERE f.status = 'APPROVED' AND f.isDeleted = false " +
           "AND f.startTime <= :currentTime AND f.endTime > :currentTime " +
           "ORDER BY f.displayPriority DESC, f.startTime ASC")
    List<FlashSale> findActiveFlashSales(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT f FROM FlashSale f WHERE f.status = 'APPROVED' AND f.isDeleted = false " +
           "AND f.startTime <= :currentTime AND f.endTime > :currentTime " +
           "ORDER BY f.displayPriority DESC, f.startTime ASC")
    Page<FlashSale> findActiveFlashSales(@Param("currentTime") LocalDateTime currentTime, Pageable pageable);
    
    // Find upcoming flash sales
    @Query("SELECT f FROM FlashSale f WHERE f.status = 'APPROVED' AND f.isDeleted = false " +
           "AND f.startTime > :currentTime " +
           "ORDER BY f.startTime ASC")
    List<FlashSale> findUpcomingFlashSales(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT f FROM FlashSale f WHERE f.status = 'APPROVED' AND f.isDeleted = false " +
           "AND f.startTime > :currentTime " +
           "ORDER BY f.startTime ASC")
    Page<FlashSale> findUpcomingFlashSales(@Param("currentTime") LocalDateTime currentTime, Pageable pageable);
    
    // Find expired flash sales
    @Query("SELECT f FROM FlashSale f WHERE f.isDeleted = false " +
           "AND f.endTime <= :currentTime " +
           "ORDER BY f.endTime DESC")
    Page<FlashSale> findExpiredFlashSales(@Param("currentTime") LocalDateTime currentTime, Pageable pageable);
    
    // Find flash sales by time range
    @Query("SELECT f FROM FlashSale f WHERE f.isDeleted = false " +
           "AND f.startTime >= :startTime AND f.endTime <= :endTime")
    List<FlashSale> findByTimeRange(@Param("startTime") LocalDateTime startTime, 
                                     @Param("endTime") LocalDateTime endTime);
    
    // Search flash sales by name
    @Query("SELECT f FROM FlashSale f WHERE f.isDeleted = false " +
           "AND LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<FlashSale> searchByName(@Param("keyword") String keyword, Pageable pageable);
    
    // Count active flash sales by shop
    @Query("SELECT COUNT(f) FROM FlashSale f WHERE f.shop.id = :shopId " +
           "AND f.status = 'APPROVED' AND f.isDeleted = false " +
           "AND f.startTime <= :currentTime AND f.endTime > :currentTime")
    Long countActiveFlashSalesByShop(@Param("shopId") UUID shopId, 
                                      @Param("currentTime") LocalDateTime currentTime);
}
