package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Products.*;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Products.ProductService;
import com.example.smart_mall_spring.Services.Shop.ShopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private final ProductService productService;
    
    @Autowired
    private final ShopService shopService;

    public ProductController(ProductService productService, ShopService shopService) {
        this.productService = productService;
        this.shopService = shopService;
    }

    // Create product with images
    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(
            @RequestParam("productData") String productDataJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> imageFiles) {
        
        try {
            ProductResponseDto result = productService.createProduct(productDataJson, imageFiles);
            return ResponseEntity.ok(ApiResponse.success("Create Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create product: " + e.getMessage()));
        }
    }

    // Create product without images
    @PostMapping("/create-simple")
    public ResponseEntity<ApiResponse<ProductResponseDto>> createSimpleProduct(
            @RequestBody CreateProductDto createProductDto) {
        try {
            ProductResponseDto result = productService.createProduct(createProductDto);
            return ResponseEntity.ok(ApiResponse.success("Create Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create product: " + e.getMessage()));
        }
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductById(@PathVariable UUID id) {
        try {
            ProductResponseDto result = productService.getProductById(id);
            
            // Tự động tăng view count của shop khi xem sản phẩm chi tiết
            if (result.getShop() != null && result.getShop().getId() != null) {
                try {
                    shopService.incrementViewCount(result.getShop().getId());
                } catch (Exception e) {
                    // Không ngừng process nếu việc tăng view count thất bại
                    System.err.println("Failed to increment shop view count: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(ApiResponse.success("Get Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get product: " + e.getMessage()));
        }
    }

    // Get product by ID including deleted
    @GetMapping("/{id}/including-deleted")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProductByIdIncludingDeleted(@PathVariable UUID id) {
        try {
            ProductResponseDto result = productService.getProductByIdIncludingDeleted(id);
            return ResponseEntity.ok(ApiResponse.success("Get Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get product: " + e.getMessage()));
        }
    }

    // Get all products
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getAllProducts() {
        List<ProductResponseDto> result = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Get All Products Success!", result));
    }

    // Get all products with pagination (default 20 items per page)
    @GetMapping
    public ResponseEntity<ApiResponse<PagedProductResponseDto>> getAllProductsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedProductResponseDto result = productService.getAllProductsWithPagination(page, size);
        return ResponseEntity.ok(ApiResponse.success("Get Products Success!", result));
    }

    // Get all products including soft deleted
    @GetMapping("/all/including-deleted")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getAllProductsIncludingDeleted() {
        List<ProductResponseDto> result = productService.getAllProductsIncludingDeleted();
        return ResponseEntity.ok(ApiResponse.success("Get All Products Including Deleted Success!", result));
    }

    // Get all soft deleted products
    @GetMapping("/deleted")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getAllDeletedProducts() {
        List<ProductResponseDto> result = productService.getAllDeletedProducts();
        return ResponseEntity.ok(ApiResponse.success("Get All Deleted Products Success!", result));
    }

    // Get products by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByCategory(@PathVariable UUID categoryId) {
        List<ProductResponseDto> result = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Category Success!", result));
    }

    // Get products by category with pagination
    @GetMapping("/category/{categoryId}/paged")
    public ResponseEntity<ApiResponse<PagedProductResponseDto>> getProductsByCategoryWithPagination(
            @PathVariable UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedProductResponseDto result = productService.getProductsByCategoryWithPagination(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Category Success!", result));
    }

    // Get products by shop
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByShop(@PathVariable UUID shopId) {
        List<ProductResponseDto> result = productService.getProductsByShop(shopId);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Shop Success!", result));
    }

    // Get products by shop with pagination
    @GetMapping("/shop/{shopId}/paged")
    public ResponseEntity<ApiResponse<PagedProductResponseDto>> getProductsByShopWithPagination(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedProductResponseDto result = productService.getProductsByShopWithPagination(shopId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Shop Success!", result));
    }

    // Get products by status
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByStatus(@PathVariable Status status) {
        List<ProductResponseDto> result = productService.getProductsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Status Success!", result));
    }

    // Get products by status with pagination
    @GetMapping("/status/{status}/paged")
    public ResponseEntity<ApiResponse<PagedProductResponseDto>> getProductsByStatusWithPagination(
            @PathVariable Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedProductResponseDto result = productService.getProductsByStatusWithPagination(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Status Success!", result));
    }

    // Search products by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> searchProductsByName(@RequestParam String name) {
        List<ProductResponseDto> result = productService.searchProductsByName(name);
        return ResponseEntity.ok(ApiResponse.success("Search Products Success!", result));
    }

    // Search products by name with pagination
    @GetMapping("/search/paged")
    public ResponseEntity<ApiResponse<PagedProductResponseDto>> searchProductsByNameWithPagination(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedProductResponseDto result = productService.searchProductsByNameWithPagination(name, page, size);
        return ResponseEntity.ok(ApiResponse.success("Search Products Success!", result));
    }

    // Advanced search
    @GetMapping("/advanced-search")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID shopId,
            @RequestParam(required = false) Status status) {
        
        List<ProductResponseDto> result = productService.searchProducts(name, brand, categoryId, shopId, status);
        return ResponseEntity.ok(ApiResponse.success("Advanced Search Success!", result));
    }

    // Advanced search with pagination
    @GetMapping("/advanced-search/paged")
    public ResponseEntity<ApiResponse<PagedProductResponseDto>> advancedSearchWithPagination(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID shopId,
            @RequestParam(required = false) Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PagedProductResponseDto result = productService.searchProductsWithPagination(name, brand, categoryId, shopId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Advanced Search Success!", result));
    }

    // Update product (flexible: images only, data only, or both)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(
            @PathVariable UUID id,
            @RequestParam(value = "productData", required = false) String productDataJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> imageFiles) {
        
        try {
            // Validate that at least one parameter is provided
            if (productDataJson == null && (imageFiles == null || imageFiles.isEmpty())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one of productData or images must be provided"));
            }
            
            ProductResponseDto result = productService.updateProductWithImages(id, productDataJson, imageFiles);
            return ResponseEntity.ok(ApiResponse.success("Update Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update product: " + e.getMessage()));
        }
    }

    // Update product without images (JSON body)
    @PutMapping("/simple/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProductSimple(
            @PathVariable UUID id,
            @RequestBody UpdateProductDto updateProductDto) {
        try {
            ProductResponseDto result = productService.updateProduct(id, updateProductDto);
            return ResponseEntity.ok(ApiResponse.success("Update Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update product: " + e.getMessage()));
        }
    }

    // Update only product images
    @PutMapping(value = "/{id}/images", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProductImages(
            @PathVariable UUID id,
            @RequestParam("images") List<MultipartFile> imageFiles) {
        
        try {
            if (imageFiles == null || imageFiles.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Images are required for this endpoint"));
            }
            
            ProductResponseDto result = productService.updateProductWithImages(id, null, imageFiles);
            return ResponseEntity.ok(ApiResponse.success("Update Product Images Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update product images: " + e.getMessage()));
        }
    }

    // Soft delete product
    @DeleteMapping("/{id}/soft")
    public ResponseEntity<ApiResponse<String>> softDeleteProduct(@PathVariable UUID id) {
        try {
            productService.softDeleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Soft Delete Product Success!", "Product has been soft deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to soft delete product: " + e.getMessage()));
        }
    }

    // Restore soft deleted product
    @PutMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<String>> restoreProduct(@PathVariable UUID id) {
        try {
            productService.restoreProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Restore Product Success!", "Product has been restored"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to restore product: " + e.getMessage()));
        }
    }

    // Hard delete product (permanent)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable UUID id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Delete Product Success!", "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete product: " + e.getMessage()));
        }
    }

    // Get product count by shop
    @GetMapping("/count/shop/{shopId}")
    public ResponseEntity<ApiResponse<Long>> getProductCountByShop(@PathVariable UUID shopId) {
        long count = productService.getProductCountByShop(shopId);
        return ResponseEntity.ok(ApiResponse.success("Get Product Count Success!", count));
    }

    // Get product count by category
    @GetMapping("/count/category/{categoryId}")
    public ResponseEntity<ApiResponse<Long>> getProductCountByCategory(@PathVariable UUID categoryId) {
        long count = productService.getProductCountByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Get Product Count Success!", count));
    }
    
    // ===== FLASH SALE ENDPOINTS =====
    
    /**
     * Set flash sale for a product variant
     * PUT /api/products/variants/{variantId}/flash-sale
     */
    @PutMapping("/variants/{variantId}/flash-sale")
    public ResponseEntity<ApiResponse<ProductVariantDto>> setFlashSale(
            @PathVariable UUID variantId,
            @Valid @RequestBody SetFlashSaleDto flashSaleDto) {
        try {
            ProductVariantDto result = productService.setFlashSale(variantId, flashSaleDto);
            return ResponseEntity.ok(ApiResponse.success("Flash sale set successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to set flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Remove flash sale from a product variant
     * DELETE /api/products/variants/{variantId}/flash-sale
     */
    @DeleteMapping("/variants/{variantId}/flash-sale")
    public ResponseEntity<ApiResponse<ProductVariantDto>> removeFlashSale(@PathVariable UUID variantId) {
        try {
            ProductVariantDto result = productService.removeFlashSale(variantId);
            return ResponseEntity.ok(ApiResponse.success("Flash sale removed successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to remove flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Get all active flash sale products
     * GET /api/products/flash-sales/active?page=0&size=20
     */
    @GetMapping("/flash-sales/active")
    public ResponseEntity<ApiResponse<Page<ProductVariantDto>>> getActiveFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<ProductVariantDto> result = productService.getActiveFlashSaleProducts(page, size);
            return ResponseEntity.ok(ApiResponse.success("Active flash sales retrieved successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get flash sales: " + e.getMessage()));
        }
    }
    
    /**
     * Get flash sale products by shop
     * GET /api/products/shops/{shopId}/flash-sales?page=0&size=20
     */
    @GetMapping("/shops/{shopId}/flash-sales")
    public ResponseEntity<ApiResponse<Page<ProductVariantDto>>> getFlashSalesByShop(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<ProductVariantDto> result = productService.getFlashSaleProductsByShop(shopId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Shop flash sales retrieved successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get shop flash sales: " + e.getMessage()));
        }
    }
    
    /**
     * Get all flash sale products by shop (including upcoming and expired)
     * For management purposes
     * GET /api/products/shops/{shopId}/flash-sales/all?page=0&size=20
     */
    @GetMapping("/shops/{shopId}/flash-sales/all")
    public ResponseEntity<ApiResponse<Page<ProductVariantDto>>> getAllFlashSalesByShop(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<ProductVariantDto> result = productService.getAllFlashSaleProductsByShop(shopId, page, size);
            return ResponseEntity.ok(ApiResponse.success("All shop flash sales retrieved successfully!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get all shop flash sales: " + e.getMessage()));
        }
    }
}