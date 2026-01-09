package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Enum.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    // Tìm sản phẩm theo category
    List<Product> findByCategoryId(UUID categoryId);
    
    // Tìm sản phẩm theo shop
    List<Product> findByShopId(UUID shopId);
    
    // Tìm sản phẩm theo status
    List<Product> findByStatus(Status status);
    
    // Tìm sản phẩm theo tên (tìm kiếm tương đối)
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:name%")
    List<Product> findByNameContaining(@Param("name") String name);
    
    // Tìm sản phẩm theo brand
    List<Product> findByBrand(String brand);
    
    // Tìm sản phẩm theo category và status
    List<Product> findByCategoryIdAndStatus(UUID categoryId, Status status);
    
    // Tìm sản phẩm theo shop và status
    List<Product> findByShopIdAndStatus(UUID shopId, Status status);
    
    // Tìm kiếm sản phẩm theo nhiều tiêu chí
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR p.name LIKE %:name%) AND " +
           "(:brand IS NULL OR p.brand = :brand) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:shopId IS NULL OR p.shop.id = :shopId) AND " +
           "(:status IS NULL OR p.status = :status)")
    List<Product> findProductsByMultipleCriteria(
            @Param("name") String name,
            @Param("brand") String brand,
            @Param("categoryId") UUID categoryId,
            @Param("shopId") UUID shopId,
            @Param("status") Status status
    );
    
    // === Dashboard Queries ===
    
    // Count products by status
    @Query("SELECT COUNT(p) FROM Product p WHERE p.status = 'PENDING'")
    Long countByStatusPending();
    
    // Đếm sản phẩm theo shop
    long countByShopId(UUID shopId);
    
    // Đếm sản phẩm theo category
    long countByCategoryId(UUID categoryId);
    
    // Phân trang - Tìm tất cả sản phẩm (chỉ ACTIVE)
    @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.status = 'ACTIVE'")
    Page<Product> findAllWithPagination(Pageable pageable);
    
    // Phân trang - Tìm sản phẩm theo category (chỉ ACTIVE)
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isDeleted = false AND p.status = 'ACTIVE'")
    Page<Product> findByCategoryIdWithPagination(@Param("categoryId") UUID categoryId, Pageable pageable);
    
    // Phân trang - Tìm sản phẩm theo shop (chỉ ACTIVE)
    @Query("SELECT p FROM Product p WHERE p.shop.id = :shopId AND p.isDeleted = false AND p.status = 'ACTIVE'")
    Page<Product> findByShopIdWithPagination(@Param("shopId") UUID shopId, Pageable pageable);
    
    // Phân trang - Tìm sản phẩm theo status
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.isDeleted = false")
    Page<Product> findByStatusWithPagination(@Param("status") Status status, Pageable pageable);
    
    // Phân trang - Tìm kiếm sản phẩm theo tên (chỉ ACTIVE)
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:name% AND p.isDeleted = false AND p.status = 'ACTIVE'")
    Page<Product> findByNameContainingWithPagination(@Param("name") String name, Pageable pageable);
    
    // Phân trang - Tìm kiếm sản phẩm theo nhiều tiêu chí (chỉ ACTIVE nếu không chỉ định status)
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR p.name LIKE %:name%) AND " +
           "(:brand IS NULL OR p.brand = :brand) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:shopId IS NULL OR p.shop.id = :shopId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "p.isDeleted = false AND " +
           "(:status IS NOT NULL OR p.status = 'ACTIVE')")
    Page<Product> findProductsByMultipleCriteriaWithPagination(
            @Param("name") String name,
            @Param("brand") String brand,
            @Param("categoryId") UUID categoryId,
            @Param("shopId") UUID shopId,
            @Param("status") Status status,
            Pageable pageable
    );
}