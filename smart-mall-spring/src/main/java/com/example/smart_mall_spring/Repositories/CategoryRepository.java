package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Categories.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    // Tìm tất cả category gốc (không có parent)
    List<Category> findByParentIsNull();
    
    // Tìm tất cả subcategory của một category
    List<Category> findByParentId(UUID parentId);
    
    // Kiểm tra tên category đã tồn tại chưa
    boolean existsByNameAndParentId(String name, UUID parentId);
    boolean existsByNameAndParentIsNull(String name);
    
    // Tìm category theo tên
    @Query("SELECT c FROM Category c WHERE c.name LIKE %:name%")
    List<Category> findByNameContaining(String name);
    
    // Phân trang - Tìm tất cả category
    Page<Category> findAll(Pageable pageable);
    
    // Phân trang - Tìm category gốc (không có parent)
    Page<Category> findByParentIsNull(Pageable pageable);
    
    // Phân trang - Tìm subcategory theo parent
    Page<Category> findByParentId(UUID parentId, Pageable pageable);
    
    // Phân trang - Tìm kiếm category theo tên
    @Query("SELECT c FROM Category c WHERE c.name LIKE %:name%")
    Page<Category> findByNameContainingWithPagination(String name, Pageable pageable);
}
