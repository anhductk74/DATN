package com.example.smart_mall_spring.Services.Products;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Products.*;
import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Entities.Categories.Category;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Products.Review;
import com.example.smart_mall_spring.Entities.Products.VariantAttribute;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Repositories.CategoryRepository;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import com.example.smart_mall_spring.Repositories.ProductVariantRepository;
import com.example.smart_mall_spring.Repositories.ShopRespository;
import com.example.smart_mall_spring.Repositories.VariantAttributeRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    @Autowired
    private final ProductRepository productRepository;
    
    @Autowired
    private final ProductVariantRepository productVariantRepository;
    
    @Autowired
    private final VariantAttributeRepository variantAttributeRepository;
    
    @Autowired
    private final CategoryRepository categoryRepository;
    
    @Autowired
    private final ShopRespository shopRepository;
    
    @Autowired
    private final CloudinaryService cloudinaryService;
    
    @Autowired
    private final ObjectMapper objectMapper;

    public ProductService(ProductRepository productRepository,
                         ProductVariantRepository productVariantRepository,
                         VariantAttributeRepository variantAttributeRepository,
                         CategoryRepository categoryRepository,
                         ShopRespository shopRepository,
                         CloudinaryService cloudinaryService,
                         ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.variantAttributeRepository = variantAttributeRepository;
        this.categoryRepository = categoryRepository;
        this.shopRepository = shopRepository;
        this.cloudinaryService = cloudinaryService;
        this.objectMapper = objectMapper;
    }

    // Create product with images
    @Transactional
    public ProductResponseDto createProduct(String productDataJson, List<MultipartFile> imageFiles) {
        try {
            CreateProductDto createProductDto = objectMapper.readValue(productDataJson, CreateProductDto.class);
            
            // Upload images to Cloudinary
            List<String> imageUrls = null;
            if (imageFiles != null && !imageFiles.isEmpty()) {
                imageUrls = imageFiles.stream()
                        .map(file -> {
                            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(file, "products");
                            return uploadResult.get("url");
                        })
                        .collect(Collectors.toList());
            }
            
            return createProduct(createProductDto, imageUrls);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create product: " + e.getMessage(), e);
        }
    }

    // Create product
    @Transactional
    public ProductResponseDto createProduct(CreateProductDto createProductDto, List<String> imageUrls) {
        // Validate required fields
        if (createProductDto.getVariants() == null || createProductDto.getVariants().isEmpty()) {
            throw new RuntimeException("Product must have at least one variant");
        }

        Product product = new Product();
        product.setName(createProductDto.getName());
        product.setDescription(createProductDto.getDescription());
        product.setBrand(createProductDto.getBrand());
        product.setImages(imageUrls);
        product.setStatus(createProductDto.getStatus());

        // Set category
        if (createProductDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(createProductDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        // Set shop
        if (createProductDto.getShopId() != null) {
            Shop shop = shopRepository.findById(createProductDto.getShopId())
                    .orElseThrow(() -> new RuntimeException("Shop not found"));
            product.setShop(shop);
        }

        // Save product first
        product = productRepository.save(product);

        // Create variants
        createProductVariants(product, createProductDto.getVariants());

        return convertToDto(product);
    }

    // Create product without images (for simple API)
    @Transactional
    public ProductResponseDto createProduct(CreateProductDto createProductDto) {
        return createProduct(createProductDto, null);
    }

    // Get product by ID
    public ProductResponseDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return convertToDto(product);
    }

    // Get all products
    public List<ProductResponseDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get products by category
    public List<ProductResponseDto> getProductsByCategory(UUID categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get products by shop
    public List<ProductResponseDto> getProductsByShop(UUID shopId) {
        List<Product> products = productRepository.findByShopId(shopId);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get products by status
    public List<ProductResponseDto> getProductsByStatus(Status status) {
        List<Product> products = productRepository.findByStatus(status);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Search products by name
    public List<ProductResponseDto> searchProductsByName(String name) {
        List<Product> products = productRepository.findByNameContaining(name);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Advanced search
    public List<ProductResponseDto> searchProducts(String name, String brand, UUID categoryId, UUID shopId, Status status) {
        List<Product> products = productRepository.findProductsByMultipleCriteria(name, brand, categoryId, shopId, status);
        return products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Update product with images
    @Transactional
    public ProductResponseDto updateProductWithImages(UUID id, String productDataJson, List<MultipartFile> imageFiles) {
        try {
            // Parse product data if provided
            UpdateProductDto updateProductDto = null;
            if (productDataJson != null && !productDataJson.trim().isEmpty()) {
                updateProductDto = objectMapper.readValue(productDataJson, UpdateProductDto.class);
            }
            
            // Upload new images if provided
            List<String> newImageUrls = null;
            if (imageFiles != null && !imageFiles.isEmpty()) {
                newImageUrls = imageFiles.stream()
                        .map(file -> {
                            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(file, "products");
                            return uploadResult.get("url");
                        })
                        .collect(Collectors.toList());
            }
            
            return updateProduct(id, updateProductDto, newImageUrls);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update product: " + e.getMessage(), e);
        }
    }

    // Update product
    @Transactional
    public ProductResponseDto updateProduct(UUID id, UpdateProductDto updateProductDto, List<String> newImageUrls) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Update basic fields if provided
        if (updateProductDto != null) {
            if (updateProductDto.getName() != null) {
                product.setName(updateProductDto.getName());
            }
            if (updateProductDto.getDescription() != null) {
                product.setDescription(updateProductDto.getDescription());
            }
            if (updateProductDto.getBrand() != null) {
                product.setBrand(updateProductDto.getBrand());
            }
            if (updateProductDto.getStatus() != null) {
                product.setStatus(updateProductDto.getStatus());
            }

            // Update category if provided
            if (updateProductDto.getCategoryId() != null) {
                Category category = categoryRepository.findById(updateProductDto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                product.setCategory(category);
            }

            // Update variants if provided
            if (updateProductDto.getVariants() != null) {
                updateProductVariants(product, updateProductDto.getVariants());
            }
        }

        // Update images if provided
        if (newImageUrls != null) {
            product.setImages(newImageUrls);
        }

        product = productRepository.save(product);
        return convertToDto(product);
    }

    // Update product without images (for simple API)
    @Transactional
    public ProductResponseDto updateProduct(UUID id, UpdateProductDto updateProductDto) {
        return updateProduct(id, updateProductDto, null);
    }

    // Delete product
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Check if any variant has been ordered or is in cart
        for (ProductVariant variant : product.getVariants()) {
            if (variant.getOrderItems() != null && !variant.getOrderItems().isEmpty()) {
                throw new RuntimeException("Cannot delete product: Product variant " + variant.getSku() + " has been ordered");
            }
            if (variant.getCartItems() != null && !variant.getCartItems().isEmpty()) {
                throw new RuntimeException("Cannot delete product: Product variant " + variant.getSku() + " is in someone's cart");
            }
        }
        
        productRepository.delete(product);
    }

    // Get product count by shop
    public long getProductCountByShop(UUID shopId) {
        return productRepository.countByShopId(shopId);
    }

    // Get product count by category
    public long getProductCountByCategory(UUID categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }

    // Convert entity to DTO
    private ProductResponseDto convertToDto(Product product) {
        // Calculate average rating
        Double averageRating = null;
        Integer reviewCount = 0;
        
        if (product.getReviews() != null && !product.getReviews().isEmpty()) {
            reviewCount = product.getReviews().size();
            averageRating = product.getReviews().stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
        }

        // Convert variants
        List<ProductVariantResponseDto> variantDtos = null;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            variantDtos = product.getVariants().stream()
                    .map(this::convertVariantToDto)
                    .collect(Collectors.toList());
        }

        return ProductResponseDto.builder()
                .id(product.getId())
                .category(product.getCategory() != null ? convertCategoryToDto(product.getCategory()) : null)
                .shop(product.getShop() != null ? convertShopToDto(product.getShop()) : null)
                .name(product.getName())
                .description(product.getDescription())
                .brand(product.getBrand())
                .images(product.getImages())
                .status(product.getStatus())
                .variants(variantDtos)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .averageRating(averageRating)
                .reviewCount(reviewCount)
                .build();
    }

    // Convert Category to DTO (simplified)
    private CategoryResponseDto convertCategoryToDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    // Convert Shop to DTO (simplified)
    private ShopResponseDto convertShopToDto(Shop shop) {
        return ShopResponseDto.builder()
                .id(shop.getId())
                .name(shop.getName())
                .description(shop.getDescription())
                .numberPhone(shop.getPhoneNumber())
                .avatar(shop.getAvatar())
                .build();
    }

    // Create product variants
    private void createProductVariants(Product product, List<CreateProductVariantDto> variantDtos) {
        for (CreateProductVariantDto variantDto : variantDtos) {
            // Check SKU uniqueness
            if (variantDto.getSku() != null && productVariantRepository.existsBySku(variantDto.getSku())) {
                throw new RuntimeException("SKU already exists: " + variantDto.getSku());
            }

            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSku(variantDto.getSku());
            variant.setPrice(variantDto.getPrice());
            variant.setStock(variantDto.getStock());
            variant.setWeight(variantDto.getWeight());
            variant.setDimensions(variantDto.getDimensions());

            // Save variant first
            variant = productVariantRepository.save(variant);

            // Create variant attributes
            if (variantDto.getAttributes() != null && !variantDto.getAttributes().isEmpty()) {
                createVariantAttributes(variant, variantDto.getAttributes());
            }
        }
    }

    // Create variant attributes
    private void createVariantAttributes(ProductVariant variant, List<CreateVariantAttributeDto> attributeDtos) {
        for (CreateVariantAttributeDto attributeDto : attributeDtos) {
            VariantAttribute attribute = new VariantAttribute();
            attribute.setVariant(variant);
            attribute.setAttributeName(attributeDto.getAttributeName());
            attribute.setAttributeValue(attributeDto.getAttributeValue());
            variantAttributeRepository.save(attribute);
        }
    }

    // Convert variant to DTO
    private ProductVariantResponseDto convertVariantToDto(ProductVariant variant) {
        List<VariantAttributeResponseDto> attributeDtos = null;
        if (variant.getAttributes() != null && !variant.getAttributes().isEmpty()) {
            attributeDtos = variant.getAttributes().stream()
                    .map(this::convertAttributeToDto)
                    .collect(Collectors.toList());
        }

        return ProductVariantResponseDto.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stock(variant.getStock())
                .weight(variant.getWeight())
                .dimensions(variant.getDimensions())
                .attributes(attributeDtos)
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }

    // Convert attribute to DTO
    private VariantAttributeResponseDto convertAttributeToDto(VariantAttribute attribute) {
        return VariantAttributeResponseDto.builder()
                .id(attribute.getId())
                .attributeName(attribute.getAttributeName())
                .attributeValue(attribute.getAttributeValue())
                .build();
    }

    // Update product variants
    private void updateProductVariants(Product product, List<UpdateProductVariantDto> variantDtos) {
        // Get current variants of the product
        List<ProductVariant> currentVariants = productVariantRepository.findByProductId(product.getId());
        
        // Collect IDs of variants that should be kept/updated
        List<UUID> variantIdsToKeep = variantDtos.stream()
                .map(UpdateProductVariantDto::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        // Delete variants that are no longer in the update list
        for (ProductVariant currentVariant : currentVariants) {
            if (!variantIdsToKeep.contains(currentVariant.getId())) {
                // Check if variant can be deleted (not in orders or carts)
                if (currentVariant.getOrderItems() != null && !currentVariant.getOrderItems().isEmpty()) {
                    throw new RuntimeException("Cannot delete variant " + currentVariant.getSku() + ": it has been ordered");
                }
                if (currentVariant.getCartItems() != null && !currentVariant.getCartItems().isEmpty()) {
                    throw new RuntimeException("Cannot delete variant " + currentVariant.getSku() + ": it is in someone's cart");
                }
                
                // Delete the variant (attributes will be deleted automatically due to cascade)
                productVariantRepository.delete(currentVariant);
            }
        }
        
        // Process variants in the update list
        for (UpdateProductVariantDto variantDto : variantDtos) {
            if (variantDto.getId() != null) {
                // Update existing variant
                Optional<ProductVariant> existingVariantOpt = productVariantRepository.findById(variantDto.getId());
                if (existingVariantOpt.isPresent()) {
                    ProductVariant existingVariant = existingVariantOpt.get();
                    
                    // Check if variant belongs to this product
                    if (!existingVariant.getProduct().getId().equals(product.getId())) {
                        throw new RuntimeException("Variant does not belong to this product");
                    }

                    // Check SKU uniqueness (excluding current variant)
                    if (variantDto.getSku() != null && 
                        productVariantRepository.existsBySkuAndIdNot(variantDto.getSku(), variantDto.getId())) {
                        throw new RuntimeException("SKU already exists: " + variantDto.getSku());
                    }

                    // Update variant fields
                    if (variantDto.getSku() != null) existingVariant.setSku(variantDto.getSku());
                    if (variantDto.getPrice() != null) existingVariant.setPrice(variantDto.getPrice());
                    if (variantDto.getStock() != null) existingVariant.setStock(variantDto.getStock());
                    if (variantDto.getWeight() != null) existingVariant.setWeight(variantDto.getWeight());
                    if (variantDto.getDimensions() != null) existingVariant.setDimensions(variantDto.getDimensions());

                    productVariantRepository.save(existingVariant);

                    // Update attributes if provided
                    if (variantDto.getAttributes() != null) {
                        // Clear existing attributes (will be deleted due to cascade)
                        existingVariant.getAttributes().clear();
                        // Create new attributes
                        createVariantAttributes(existingVariant, variantDto.getAttributes());
                    }
                }
            } else {
                // Create new variant
                CreateProductVariantDto createDto = CreateProductVariantDto.builder()
                        .sku(variantDto.getSku())
                        .price(variantDto.getPrice())
                        .stock(variantDto.getStock())
                        .weight(variantDto.getWeight())
                        .dimensions(variantDto.getDimensions())
                        .attributes(variantDto.getAttributes())
                        .build();
                        
                createProductVariants(product, List.of(createDto));
            }
        }
        
        // Validate that product still has at least one variant
        long remainingVariants = productVariantRepository.countByProductId(product.getId());
        if (remainingVariants == 0) {
            throw new RuntimeException("Product must have at least one variant");
        }
    }
}