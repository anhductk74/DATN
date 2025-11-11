package com.example.smart_mall_spring.Services.Categories;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.CreateCategoryDto;
import com.example.smart_mall_spring.Dtos.Categories.PagedCategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.UpdateCategoryDto;
import com.example.smart_mall_spring.Entities.Categories.Category;
import com.example.smart_mall_spring.Repositories.CategoryRepository;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    
    @Autowired
    private final CategoryRepository categoryRepository;
    
    @Autowired
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    // Create category
    public CategoryResponseDto createCategory(CreateCategoryDto createCategoryDto) {
        // Kiểm tra tên category đã tồn tại chưa
        if (createCategoryDto.getParentId() != null) {
            if (categoryRepository.existsByNameAndParentId(createCategoryDto.getName(), createCategoryDto.getParentId())) {
                throw new RuntimeException("Category name already exists in this parent category");
            }
        } else {
            if (categoryRepository.existsByNameAndParentIsNull(createCategoryDto.getName())) {
                throw new RuntimeException("Root category name already exists");
            }
        }

        Category category = new Category();
        category.setName(createCategoryDto.getName());
        category.setDescription(createCategoryDto.getDescription());
        
        // Set status (default to ACTIVE if not provided)
        if (createCategoryDto.getStatus() != null) {
            category.setStatus(createCategoryDto.getStatus());
        }

        // Set parent category if provided
        if (createCategoryDto.getParentId() != null) {
            Category parent = categoryRepository.findById(createCategoryDto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return convertToDto(category);
    }

    // Get all root categories (with subcategories)
    public List<CategoryResponseDto> getAllRootCategories() {
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::convertToDtoWithSubCategories)
                .collect(Collectors.toList());
    }

    // Get all categories (flat list)
    public List<CategoryResponseDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get all categories with pagination
    public PagedCategoryResponseDto getAllCategoriesWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        
        List<CategoryResponseDto> categories = categoryPage.getContent().stream()
                .map(this::convertToDto)
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

    // Get all root categories with pagination
    public PagedCategoryResponseDto getAllRootCategoriesWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findByParentIsNull(pageable);
        
        List<CategoryResponseDto> categories = categoryPage.getContent().stream()
                .map(this::convertToDtoWithSubCategories)
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

    // Get category by ID
    public CategoryResponseDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return convertToDtoWithSubCategories(category);
    }

    // Get subcategories by parent ID
    public List<CategoryResponseDto> getSubCategories(UUID parentId) {
        List<Category> subCategories = categoryRepository.findByParentId(parentId);
        return subCategories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get subcategories by parent ID with pagination
    public PagedCategoryResponseDto getSubCategoriesWithPagination(UUID parentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findByParentId(parentId, pageable);
        
        List<CategoryResponseDto> categories = categoryPage.getContent().stream()
                .map(this::convertToDto)
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

    // Update category
    public CategoryResponseDto updateCategory(UUID id, UpdateCategoryDto updateCategoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Update fields if provided
        if (updateCategoryDto.getName() != null) {
            // Kiểm tra tên mới đã tồn tại chưa (trừ chính nó)
            if (updateCategoryDto.getParentId() != null) {
                if (categoryRepository.existsByNameAndParentId(updateCategoryDto.getName(), updateCategoryDto.getParentId()) 
                    && !category.getName().equals(updateCategoryDto.getName())) {
                    throw new RuntimeException("Category name already exists in this parent category");
                }
            } else {
                if (categoryRepository.existsByNameAndParentIsNull(updateCategoryDto.getName()) 
                    && !category.getName().equals(updateCategoryDto.getName())) {
                    throw new RuntimeException("Root category name already exists");
                }
            }
            category.setName(updateCategoryDto.getName());
        }

        if (updateCategoryDto.getDescription() != null) {
            category.setDescription(updateCategoryDto.getDescription());
        }
        
        if (updateCategoryDto.getStatus() != null) {
            category.setStatus(updateCategoryDto.getStatus());
        }

        // Update parent if provided
        if (updateCategoryDto.getParentId() != null) {
            if (updateCategoryDto.getParentId().equals(id)) {
                throw new RuntimeException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(updateCategoryDto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return convertToDto(category);
    }

    // Delete category
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Kiểm tra xem category có subcategories không
        List<Category> subCategories = categoryRepository.findByParentId(id);
        if (!subCategories.isEmpty()) {
            throw new RuntimeException("Cannot delete category that has subcategories. Delete subcategories first.");
        }

        categoryRepository.delete(category);
    }

    // Search categories by name
    public List<CategoryResponseDto> searchCategories(String name) {
        List<Category> categories = categoryRepository.findByNameContaining(name);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Search categories by name with pagination
    public PagedCategoryResponseDto searchCategoriesWithPagination(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categoryPage = categoryRepository.findByNameContainingWithPagination(name, pageable);
        
        List<CategoryResponseDto> categories = categoryPage.getContent().stream()
                .map(this::convertToDto)
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

    // Convert to DTO without subcategories
    private CategoryResponseDto convertToDto(Category category) {
        Long productCount = productRepository.countByCategoryId(category.getId());
        
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus())
                .parent(category.getParent() != null ? convertToDtoWithoutParent(category.getParent()) : null)
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    // Convert to DTO with subcategories
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
                .status(category.getStatus())
                .parent(category.getParent() != null ? convertToDtoWithoutParent(category.getParent()) : null)
                .subCategories(subCategoryDtos)
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
    
    // Convert to DTO without parent (to avoid circular reference)
    private CategoryResponseDto convertToDtoWithoutParent(Category category) {
        Long productCount = productRepository.countByCategoryId(category.getId());
        
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus())
                .parent(null)
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
