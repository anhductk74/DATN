package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.CreateCategoryDto;
import com.example.smart_mall_spring.Dtos.Categories.PagedCategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.UpdateCategoryDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Categories.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Create category
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponseDto>> createCategory(
            @RequestBody CreateCategoryDto createCategoryDto) {
        try {
            CategoryResponseDto result = categoryService.createCategory(createCategoryDto);
            return ResponseEntity.ok(ApiResponse.success("Create Category Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create category: " + e.getMessage()));
        }
    }

    // Get all root categories (hierarchical structure)
    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getAllRootCategories() {
        List<CategoryResponseDto> result = categoryService.getAllRootCategories();
        return ResponseEntity.ok(ApiResponse.success("Get Root Categories Success!", result));
    }

    // Get all root categories with pagination
    @GetMapping("/root/paged")
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> getAllRootCategoriesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedCategoryResponseDto result = categoryService.getAllRootCategoriesWithPagination(page, size);
        return ResponseEntity.ok(ApiResponse.success("Get Root Categories Success!", result));
    }

    // Get all categories (flat list)
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getAllCategories() {
        List<CategoryResponseDto> result = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Get All Categories Success!", result));
    }

    // Get all categories with pagination
    @GetMapping
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> getAllCategoriesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedCategoryResponseDto result = categoryService.getAllCategoriesWithPagination(page, size);
        return ResponseEntity.ok(ApiResponse.success("Get All Categories Success!", result));
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> getCategoryById(@PathVariable UUID id) {
        try {
            CategoryResponseDto result = categoryService.getCategoryById(id);
            return ResponseEntity.ok(ApiResponse.success("Get Category Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get category: " + e.getMessage()));
        }
    }

    // Get subcategories by parent ID
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getSubCategories(@PathVariable UUID parentId) {
        List<CategoryResponseDto> result = categoryService.getSubCategories(parentId);
        return ResponseEntity.ok(ApiResponse.success("Get Subcategories Success!", result));
    }

    // Get subcategories by parent ID with pagination
    @GetMapping("/{parentId}/subcategories/paged")
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> getSubCategoriesWithPagination(
            @PathVariable UUID parentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedCategoryResponseDto result = categoryService.getSubCategoriesWithPagination(parentId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get Subcategories Success!", result));
    }

    // Update category
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> updateCategory(
            @PathVariable UUID id,
            @RequestBody UpdateCategoryDto updateCategoryDto) {
        try {
            CategoryResponseDto result = categoryService.updateCategory(id, updateCategoryDto);
            return ResponseEntity.ok(ApiResponse.success("Update Category Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update category: " + e.getMessage()));
        }
    }

    // Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable UUID id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Delete Category Success!", "Category deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete category: " + e.getMessage()));
        }
    }

    // Search categories by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> searchCategories(
            @RequestParam String name) {
        List<CategoryResponseDto> result = categoryService.searchCategories(name);
        return ResponseEntity.ok(ApiResponse.success("Search Categories Success!", result));
    }

    // Search categories by name with pagination
    @GetMapping("/search/paged")
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> searchCategoriesWithPagination(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedCategoryResponseDto result = categoryService.searchCategoriesWithPagination(name, page, size);
        return ResponseEntity.ok(ApiResponse.success("Search Categories Success!", result));
    }
}
