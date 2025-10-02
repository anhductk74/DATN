package com.example.smart_mall_spring.Services.Categories;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Categories.CreateCategoryDto;
import com.example.smart_mall_spring.Dtos.Categories.UpdateCategoryDto;
import com.example.smart_mall_spring.Entities.Categories.Category;
import com.example.smart_mall_spring.Repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    
    @Autowired
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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

    // Convert to DTO without subcategories
    private CategoryResponseDto convertToDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parent(category.getParent() != null ? convertToDto(category.getParent()) : null)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    // Convert to DTO with subcategories
    private CategoryResponseDto convertToDtoWithSubCategories(Category category) {
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
                .parent(category.getParent() != null ? convertToDto(category.getParent()) : null)
                .subCategories(subCategoryDtos)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
