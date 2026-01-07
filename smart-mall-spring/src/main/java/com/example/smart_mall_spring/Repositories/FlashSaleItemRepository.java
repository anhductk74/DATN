package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.FlashSale.FlashSaleItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, UUID> {
    
    // Find items by flash sale
    List<FlashSaleItem> findByFlashSaleId(UUID flashSaleId);
    
    Page<FlashSaleItem> findByFlashSaleId(UUID flashSaleId, Pageable pageable);
    
    // Find active items by flash sale
    List<FlashSaleItem> findByFlashSaleIdAndIsActiveTrue(UUID flashSaleId);
    
    // Find items by product
    List<FlashSaleItem> findByProductId(UUID productId);
    
    // Find items by product variant
    List<FlashSaleItem> findByProductVariantId(UUID productVariantId);
    
    // Find items with stock
    @Query("SELECT i FROM FlashSaleItem i WHERE i.flashSale.id = :flashSaleId " +
           "AND i.isActive = true AND i.remainingQuantity > 0")
    List<FlashSaleItem> findAvailableItemsByFlashSale(@Param("flashSaleId") UUID flashSaleId);
    
    // Check if product exists in flash sale
    @Query("SELECT COUNT(i) > 0 FROM FlashSaleItem i WHERE i.flashSale.id = :flashSaleId " +
           "AND i.product.id = :productId")
    boolean existsByFlashSaleAndProduct(@Param("flashSaleId") UUID flashSaleId, 
                                        @Param("productId") UUID productId);
    
    // Check if product variant exists in flash sale
    @Query("SELECT COUNT(i) > 0 FROM FlashSaleItem i WHERE i.flashSale.id = :flashSaleId " +
           "AND i.productVariant.id = :variantId")
    boolean existsByFlashSaleAndProductVariant(@Param("flashSaleId") UUID flashSaleId, 
                                                @Param("variantId") UUID variantId);
    
    // Update remaining quantity
    @Modifying
    @Query("UPDATE FlashSaleItem i SET i.remainingQuantity = i.remainingQuantity - :quantity, " +
           "i.soldQuantity = i.soldQuantity + :quantity " +
           "WHERE i.id = :itemId AND i.remainingQuantity >= :quantity")
    int decreaseQuantity(@Param("itemId") UUID itemId, @Param("quantity") Integer quantity);
    
    // Find best selling items
    @Query("SELECT i FROM FlashSaleItem i WHERE i.flashSale.id = :flashSaleId " +
           "ORDER BY i.soldQuantity DESC")
    Page<FlashSaleItem> findBestSellingItems(@Param("flashSaleId") UUID flashSaleId, Pageable pageable);
    
    // Get total sold quantity for flash sale
    @Query("SELECT COALESCE(SUM(i.soldQuantity), 0) FROM FlashSaleItem i " +
           "WHERE i.flashSale.id = :flashSaleId")
    Long getTotalSoldQuantity(@Param("flashSaleId") UUID flashSaleId);
    
    // Get total revenue for flash sale
    @Query("SELECT COALESCE(SUM(i.flashSalePrice * i.soldQuantity), 0.0) FROM FlashSaleItem i " +
           "WHERE i.flashSale.id = :flashSaleId")
    Double getTotalRevenue(@Param("flashSaleId") UUID flashSaleId);
}
