package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.CreateCategoryDto;
import com.example.smart_mall_spring.Dtos.Categories.PagedCategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.UpdateCategoryDto;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Categories.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ObjectMapper objectMapper;

    /**
     * Create a new category (JSON)
     * POST /api/categories
     * Content-Type: application/json
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<CategoryResponseDto>> createCategory(
            @Valid @RequestBody CreateCategoryDto createCategoryDto) {
        log.info("REST request to create category: {}", createCategoryDto.getName());
        CategoryResponseDto result = categoryService.createCategory(createCategoryDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", result));
    }

    /**
     * Create a new category with image (Multipart)
     * POST /api/categories/upload
     * Content-Type: multipart/form-data
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoryResponseDto>> createCategoryWithImage(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "parentId", required = false) String parentIdStr,
            @RequestParam(value = "status", required = false) String statusStr) {
        
        log.info("REST request to create category with image: {}", name);
        
        try {
            // Build DTO
            CreateCategoryDto dto = CreateCategoryDto.builder()
                    .name(name)
                    .description(description)
                    .parentId(parentIdStr != null ? UUID.fromString(parentIdStr) : null)
                    .status(statusStr != null ? Status.valueOf(statusStr) : Status.ACTIVE)
                    .build();
            
            CategoryResponseDto result = categoryService.createCategoryWithImage(dto, imageFile);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Category created successfully with image", result));
        } catch (Exception e) {
            log.error("Error creating category with image: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Failed to create category: " + e.getMessage()));
        }
    }

    /**
     * Get all root categories (hierarchical structure)
     * GET /api/categories/root
     */
    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getAllRootCategories() {
        log.info("REST request to get all root categories");
        List<CategoryResponseDto> result = categoryService.getAllRootCategories();
        return ResponseEntity.ok(ApiResponse.success("Root categories retrieved successfully", result));
    }

    /**
     * Get all root categories with pagination
     * GET /api/categories/root/paged?page=0&size=20
     */
    @GetMapping("/root/paged")
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> getAllRootCategoriesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to get root categories with pagination - page: {}, size: {}", page, size);
        PagedCategoryResponseDto result = categoryService.getAllRootCategoriesWithPagination(page, size);
        return ResponseEntity.ok(ApiResponse.success("Root categories retrieved successfully", result));
    }

    /**
     * Get all categories (flat list)
     * GET /api/categories/all
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getAllCategories() {
        log.info("REST request to get all categories");
        List<CategoryResponseDto> result = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", result));
    }

    /**
     * Get all categories with pagination
     * GET /api/categories?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> getAllCategoriesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to get categories with pagination - page: {}, size: {}", page, size);
        PagedCategoryResponseDto result = categoryService.getAllCategoriesWithPagination(page, size);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", result));
    }

    /**
     * Get category by ID
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> getCategoryById(@PathVariable UUID id) {
        log.info("REST request to get category by id: {}", id);
        CategoryResponseDto result = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", result));
    }

    /**
     * Get subcategories by parent ID
     * GET /api/categories/{parentId}/subcategories
     */
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> getSubCategories(@PathVariable UUID parentId) {
        log.info("REST request to get subcategories for parent id: {}", parentId);
        List<CategoryResponseDto> result = categoryService.getSubCategories(parentId);
        return ResponseEntity.ok(ApiResponse.success("Subcategories retrieved successfully", result));
    }

    /**
     * Get subcategories by parent ID with pagination
     * GET /api/categories/{parentId}/subcategories/paged?page=0&size=20
     */
    @GetMapping("/{parentId}/subcategories/paged")
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> getSubCategoriesWithPagination(
            @PathVariable UUID parentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to get subcategories for parent id: {} with pagination - page: {}, size: {}", 
                 parentId, page, size);
        PagedCategoryResponseDto result = categoryService.getSubCategoriesWithPagination(parentId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Subcategories retrieved successfully", result));
    }

    /**
     * Update category (JSON)
     * PUT /api/categories/{id}
     * Content-Type: application/json
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<CategoryResponseDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryDto updateCategoryDto) {
        log.info("REST request to update category with id: {}", id);
        CategoryResponseDto result = categoryService.updateCategory(id, updateCategoryDto);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", result));
    }

    /**
     * Update category with image (Multipart)
     * PUT /api/categories/{id}/upload
     * Content-Type: multipart/form-data
     */
    @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoryResponseDto>> updateCategoryWithImage(
            @PathVariable UUID id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "parentId", required = false) String parentIdStr,
            @RequestParam(value = "status", required = false) String statusStr) {
        
        log.info("REST request to update category with id: {} and image", id);
        
        try {
            // Build DTO
            UpdateCategoryDto dto = UpdateCategoryDto.builder()
                    .name(name)
                    .description(description)
                    .parentId(parentIdStr != null ? UUID.fromString(parentIdStr) : null)
                    .status(statusStr != null ? Status.valueOf(statusStr) : null)
                    .build();
            
            CategoryResponseDto result = categoryService.updateCategoryWithImage(id, dto, imageFile);
            return ResponseEntity.ok(ApiResponse.success("Category updated successfully with image", result));
        } catch (Exception e) {
            log.error("Error updating category with image: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Failed to update category: " + e.getMessage()));
        }
    }

    /**
     * Delete category
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        log.info("REST request to delete category with id: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    /**
     * Search categories by name
     * GET /api/categories/search?name=electronics
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CategoryResponseDto>>> searchCategories(
            @RequestParam String name) {
        log.info("REST request to search categories by name: {}", name);
        List<CategoryResponseDto> result = categoryService.searchCategories(name);
        return ResponseEntity.ok(ApiResponse.success("Categories found successfully", result));
    }

    /**
     * Search categories by name with pagination
     * GET /api/categories/search/paged?name=electronics&page=0&size=20
     */
    @GetMapping("/search/paged")
    public ResponseEntity<ApiResponse<PagedCategoryResponseDto>> searchCategoriesWithPagination(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("REST request to search categories by name: {} with pagination - page: {}, size: {}", 
                 name, page, size);
        PagedCategoryResponseDto result = categoryService.searchCategoriesWithPagination(name, page, size);
        return ResponseEntity.ok(ApiResponse.success("Categories found successfully", result));
    }
}
