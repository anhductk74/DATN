package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.ProductVariant;
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
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    
    List<ProductVariant> findByProductId(UUID productId);
    
    long countByProductId(UUID productId);
    
    Optional<ProductVariant> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    boolean existsBySkuAndIdNot(String sku, UUID id);
    
    // Find active flash sale variants
    @Query("SELECT v FROM ProductVariant v WHERE v.isFlashSale = true " +
           "AND v.flashSaleStart <= :now AND v.flashSaleEnd > :now " +
           "AND (v.flashSaleQuantity IS NULL OR v.flashSaleQuantity > 0)")
    Page<ProductVariant> findFlashSaleVariants(@Param("now") LocalDateTime now, Pageable pageable);
    
    // Find all flash sale variants (including expired)
    @Query("SELECT v FROM ProductVariant v WHERE v.isFlashSale = true")
    Page<ProductVariant> findAllFlashSaleVariants(Pageable pageable);
    
    // Find flash sale variants by shop
    @Query("SELECT v FROM ProductVariant v JOIN v.product p WHERE p.shop.id = :shopId " +
           "AND v.isFlashSale = true AND v.flashSaleStart <= :now AND v.flashSaleEnd > :now " +
           "AND (v.flashSaleQuantity IS NULL OR v.flashSaleQuantity > 0)")
    Page<ProductVariant> findFlashSaleVariantsByShop(@Param("shopId") UUID shopId, @Param("now") LocalDateTime now, Pageable pageable);
    
    // Find all flash sale variants by shop (including upcoming and expired)
    @Query("SELECT v FROM ProductVariant v JOIN v.product p WHERE p.shop.id = :shopId " +
           "AND v.isFlashSale = true ORDER BY v.flashSaleStart DESC")
    Page<ProductVariant> findAllFlashSaleVariantsByShop(@Param("shopId") UUID shopId, Pageable pageable);
}