package com.example.smart_mall_spring.Services.Categories;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.CreateCategoryDto;
import com.example.smart_mall_spring.Dtos.Categories.PagedCategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.UpdateCategoryDto;
import com.example.smart_mall_spring.Entities.Categories.Category;
import com.example.smart_mall_spring.Exception.CategoryNotFoundException;
import com.example.smart_mall_spring.Exception.DuplicateCategoryException;
import com.example.smart_mall_spring.Exception.InvalidCategoryOperationException;
import com.example.smart_mall_spring.Repositories.CategoryRepository;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Create a new category
     */
    @Transactional
    public CategoryResponseDto createCategory(CreateCategoryDto createCategoryDto) {
        log.info("Creating category with name: {}", createCategoryDto.getName());
        
        // Validate category name uniqueness
        validateCategoryNameUniqueness(createCategoryDto.getName(), createCategoryDto.getParentId(), null);

        Category category = buildCategoryFromDto(createCategoryDto);
        
        // Set parent category if provided
        if (createCategoryDto.getParentId() != null) {
            Category parent = findCategoryById(createCategoryDto.getParentId());
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        log.info("Successfully created category with id: {}", category.getId());
        
        return convertToDto(category);
    }

    /**
     * Create a new category with image upload
     */
    @Transactional
    public CategoryResponseDto createCategoryWithImage(CreateCategoryDto createCategoryDto, MultipartFile imageFile) {
        log.info("Creating category with name: {} and image upload", createCategoryDto.getName());
        
        // Validate category name uniqueness
        validateCategoryNameUniqueness(createCategoryDto.getName(), createCategoryDto.getParentId(), null);

        Category category = buildCategoryFromDto(createCategoryDto);
        
        // Upload image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = uploadCategoryImage(imageFile);
            category.setImage(imageUrl);
        }
        
        // Set parent category if provided
        if (createCategoryDto.getParentId() != null) {
            Category parent = findCategoryById(createCategoryDto.getParentId());
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        log.info("Successfully created category with id: {} and image", category.getId());
        
        return convertToDto(category);
    }

    /**
     * Get all root categories (with subcategories)
     */
    public List<CategoryResponseDto> getAllRootCategories() {
        log.debug("Fetching all root categories");
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::convertToDtoWithSubCategories)
                .collect(Collectors.toList());
    }

    /**
     * Get all categories (flat list)
     */
    public List<CategoryResponseDto> getAllCategories() {
        log.debug("Fetching all categories");
        List<Category> categories = categoryRepository.findAll(Sort.by("name").ascending());
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all categories with pagination
     */
    public PagedCategoryResponseDto getAllCategoriesWithPagination(int page, int size) {
        log.debug("Fetching categories - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        
        return buildPagedResponse(categoryPage, false);
    }

    /**
     * Get all root categories with pagination
     */
    public PagedCategoryResponseDto getAllRootCategoriesWithPagination(int page, int size) {
        log.debug("Fetching root categories - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findByParentIsNull(pageable);
        
        return buildPagedResponse(categoryPage, true);
    }

    /**
     * Get category by ID
     */
    public CategoryResponseDto getCategoryById(UUID id) {
        log.debug("Fetching category with id: {}", id);
        Category category = findCategoryById(id);
        return convertToDtoWithSubCategories(category);
    }

    /**
     * Get subcategories by parent ID
     */
    public List<CategoryResponseDto> getSubCategories(UUID parentId) {
        log.debug("Fetching subcategories for parent id: {}", parentId);
        
        // Validate parent exists
        findCategoryById(parentId);
        
        List<Category> subCategories = categoryRepository.findByParentId(parentId);
        return subCategories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get subcategories by parent ID with pagination
     */
    public PagedCategoryResponseDto getSubCategoriesWithPagination(UUID parentId, int page, int size) {
        log.debug("Fetching subcategories for parent id: {} - page: {}, size: {}", parentId, page, size);
        
        // Validate parent exists
        findCategoryById(parentId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findByParentId(parentId, pageable);
        
        return buildPagedResponse(categoryPage, false);
    }

    /**
     * Update category
     */
    @Transactional
    public CategoryResponseDto updateCategory(UUID id, UpdateCategoryDto updateCategoryDto) {
        log.info("Updating category with id: {}", id);
        
        Category category = findCategoryById(id);

        // Update name if provided
        if (StringUtils.hasText(updateCategoryDto.getName()) && 
            !category.getName().equals(updateCategoryDto.getName())) {
            validateCategoryNameUniqueness(
                updateCategoryDto.getName(), 
                category.getParent() != null ? category.getParent().getId() : null,
                id
            );
            category.setName(updateCategoryDto.getName());
        }

        // Update other fields if provided
        if (updateCategoryDto.getDescription() != null) {
            category.setDescription(updateCategoryDto.getDescription());
        }
        
        if (updateCategoryDto.getImage() != null) {
            category.setImage(updateCategoryDto.getImage());
        }
        
        if (updateCategoryDto.getStatus() != null) {
            category.setStatus(updateCategoryDto.getStatus());
        }

        // Update parent if provided
        if (updateCategoryDto.getParentId() != null) {
            if (updateCategoryDto.getParentId().equals(id)) {
                throw new InvalidCategoryOperationException("Category cannot be its own parent");
            }
            
            // Check for circular reference
            validateNoCircularReference(id, updateCategoryDto.getParentId());
            
            Category parent = findCategoryById(updateCategoryDto.getParentId());
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        log.info("Successfully updated category with id: {}", id);
        
        return convertToDto(category);
    }

    /**
     * Update category with image upload
     */
    @Transactional
    public CategoryResponseDto updateCategoryWithImage(UUID id, UpdateCategoryDto updateCategoryDto, MultipartFile imageFile) {
        log.info("Updating category with id: {} and image upload", id);
        
        Category category = findCategoryById(id);
        String oldImage = category.getImage();

        // Update name if provided
        if (StringUtils.hasText(updateCategoryDto.getName()) && 
            !category.getName().equals(updateCategoryDto.getName())) {
            validateCategoryNameUniqueness(
                updateCategoryDto.getName(), 
                category.getParent() != null ? category.getParent().getId() : null,
                id
            );
            category.setName(updateCategoryDto.getName());
        }

        // Update other fields if provided
        if (updateCategoryDto.getDescription() != null) {
            category.setDescription(updateCategoryDto.getDescription());
        }
        
        // Upload new image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            String newImageUrl = uploadCategoryImage(imageFile);
            category.setImage(newImageUrl);
            
            // Delete old image from Cloudinary if exists
            if (StringUtils.hasText(oldImage)) {
                deleteOldCategoryImage(oldImage);
            }
        } else if (updateCategoryDto.getImage() != null) {
            // Update image URL from DTO if no file upload
            category.setImage(updateCategoryDto.getImage());
        }
        
        if (updateCategoryDto.getStatus() != null) {
            category.setStatus(updateCategoryDto.getStatus());
        }

        // Update parent if provided
        if (updateCategoryDto.getParentId() != null) {
            if (updateCategoryDto.getParentId().equals(id)) {
                throw new InvalidCategoryOperationException("Category cannot be its own parent");
            }
            
            // Check for circular reference
            validateNoCircularReference(id, updateCategoryDto.getParentId());
            
            Category parent = findCategoryById(updateCategoryDto.getParentId());
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        log.info("Successfully updated category with id: {} and image", id);
        
        return convertToDto(category);
    }

    /**
     * Delete category
     */
    @Transactional
    public void deleteCategory(UUID id) {
        log.info("Deleting category with id: {}", id);
        
        Category category = findCategoryById(id);

        // Check if category has subcategories
        List<Category> subCategories = categoryRepository.findByParentId(id);
        if (!subCategories.isEmpty()) {
            throw new InvalidCategoryOperationException(
                "Cannot delete category that has " + subCategories.size() + " subcategories. Delete subcategories first."
            );
        }
        
        // Check if category has products
        Long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new InvalidCategoryOperationException(
                "Cannot delete category that has " + productCount + " products. Remove or reassign products first."
            );
        }

        categoryRepository.delete(category);
        log.info("Successfully deleted category with id: {}", id);
    }

    /**
     * Search categories by name
     */
    public List<CategoryResponseDto> searchCategories(String name) {
        log.debug("Searching categories with name containing: {}", name);
        
        if (!StringUtils.hasText(name)) {
            return getAllCategories();
        }
        
        List<Category> categories = categoryRepository.findByNameContaining(name);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Search categories by name with pagination
     */
    public PagedCategoryResponseDto searchCategoriesWithPagination(String name, int page, int size) {
        log.debug("Searching categories with name containing: {} - page: {}, size: {}", name, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Page<Category> categoryPage;
        if (!StringUtils.hasText(name)) {
            categoryPage = categoryRepository.findAll(pageable);
        } else {
            categoryPage = categoryRepository.findByNameContainingWithPagination(name, pageable);
        }
        
        return buildPagedResponse(categoryPage, false);
    }

    // =============== Private Helper Methods ===============

    /**
     * Find category by ID or throw exception
     */
    private Category findCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with id: " + id));
    }

    /**
     * Validate category name uniqueness
     */
    private void validateCategoryNameUniqueness(String name, UUID parentId, UUID excludeId) {
        boolean exists;
        
        if (parentId != null) {
            exists = categoryRepository.existsByNameAndParentId(name, parentId);
        } else {
            exists = categoryRepository.existsByNameAndParentIsNull(name);
        }
        
        if (exists) {
            // If updating, check if it's the same category
            if (excludeId != null) {
                Category existing = parentId != null 
                    ? categoryRepository.findByNameAndParentId(name, parentId).orElse(null)
                    : categoryRepository.findByNameAndParentIsNull(name).orElse(null);
                    
                if (existing != null && !existing.getId().equals(excludeId)) {
                    throw new DuplicateCategoryException("Category name already exists in this parent category");
                }
            } else {
                throw new DuplicateCategoryException("Category name already exists in this parent category");
            }
        }
    }

    /**
     * Validate no circular reference in parent-child relationship
     */
    private void validateNoCircularReference(UUID categoryId, UUID newParentId) {
        UUID currentParentId = newParentId;
        
        while (currentParentId != null) {
            if (currentParentId.equals(categoryId)) {
                throw new InvalidCategoryOperationException("Circular reference detected: Cannot set parent category");
            }
            
            Category parent = findCategoryById(currentParentId);
            currentParentId = parent.getParent() != null ? parent.getParent().getId() : null;
        }
    }

    /**
     * Build category entity from DTO
     */
    private Category buildCategoryFromDto(CreateCategoryDto dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImage(dto.getImage());
        
        if (dto.getStatus() != null) {
            category.setStatus(dto.getStatus());
        }
        
        return category;
    }

    /**
     * Build paged response
     */
    private PagedCategoryResponseDto buildPagedResponse(Page<Category> categoryPage, boolean withSubCategories) {
        List<CategoryResponseDto> categories = categoryPage.getContent().stream()
                .map(category -> withSubCategories ? convertToDtoWithSubCategories(category) : convertToDto(category))
                .collect(Collectors.toList());
        
        return PagedCategoryResponseDto.builder()
                .categories(categories)
                .currentPage(categoryPage.getNumber())
                .totalPages(categoryPage.getTotalPages())
                .totalItems(categoryPage.getTotalElements())
                .pageSize(categoryPage.getSize())
                .hasNext(categoryPage.hasNext())
                .hasPrevious(categoryPage.hasPrevious())
                .build();
    }

    /**
     * Convert to DTO without subcategories
     */
    private CategoryResponseDto convertToDto(Category category) {
        Long productCount = productRepository.countByCategoryId(category.getId());
        
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .status(category.getStatus())
                .parent(category.getParent() != null ? convertToDtoWithoutParent(category.getParent()) : null)
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Convert to DTO with subcategories
     */
    private CategoryResponseDto convertToDtoWithSubCategories(Category category) {
        Long productCount = productRepository.countByCategoryId(category.getId());
        
        List<CategoryResponseDto> subCategoryDtos = null;
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            subCategoryDtos = category.getSubCategories().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .status(category.getStatus())
                .parent(category.getParent() != null ? convertToDtoWithoutParent(category.getParent()) : null)
                .subCategories(subCategoryDtos)
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert to DTO without parent (to avoid circular reference)
     */
    private CategoryResponseDto convertToDtoWithoutParent(Category category) {
        Long productCount = productRepository.countByCategoryId(category.getId());
        
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .status(category.getStatus())
                .parent(null)
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Upload category image to Cloudinary
     */
    private String uploadCategoryImage(MultipartFile imageFile) {
        try {
            log.debug("Uploading category image to Cloudinary");
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(imageFile, "categories");
            String imageUrl = uploadResult.get("url");
            log.info("Successfully uploaded category image: {}", imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.error("Failed to upload category image: {}", e.getMessage());
            throw new RuntimeException("Failed to upload category image: " + e.getMessage(), e);
        }
    }

    /**
     * Delete old category image from Cloudinary
     */
    private void deleteOldCategoryImage(String imageUrl) {
        try {
            if (StringUtils.hasText(imageUrl) && imageUrl.contains("/categories/")) {
                // Extract public_id from URL
                String publicId = extractPublicIdFromUrl(imageUrl);
                if (publicId != null) {
                    log.debug("Deleting old category image: {}", publicId);
                    cloudinaryService.deleteFile(publicId);
                    log.info("Successfully deleted old category image");
                }
            }
        } catch (Exception e) {
            // Log error but don't throw - deleting old image is not critical
            log.warn("Failed to delete old category image: {}", e.getMessage());
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     * Example: /dadr6xuhc/image/upload/v1234/categories/abc123.jpg -> categories/abc123
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            if (url.contains("/categories/")) {
                int startIndex = url.indexOf("/categories/");
                String path = url.substring(startIndex + 1); // Remove leading slash
                // Remove file extension
                int dotIndex = path.lastIndexOf('.');
                if (dotIndex > 0) {
                    path = path.substring(0, dotIndex);
                }
                return path;
            }
        } catch (Exception e) {
            log.warn("Failed to extract public_id from URL: {}", url);
        }
        return null;
    }
}
