package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Enum.Status;
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
    
    // Đếm sản phẩm theo shop
    long countByShopId(UUID shopId);
    
    // Đếm sản phẩm theo category
    long countByCategoryId(UUID categoryId);
}