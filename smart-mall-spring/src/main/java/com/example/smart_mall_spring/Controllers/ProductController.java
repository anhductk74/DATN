package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Products.CreateProductDto;
import com.example.smart_mall_spring.Dtos.Products.ProductResponseDto;
import com.example.smart_mall_spring.Dtos.Products.UpdateProductDto;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Products.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
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

    public ProductController(ProductService productService) {
        this.productService = productService;
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

    // Get products by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByCategory(@PathVariable UUID categoryId) {
        List<ProductResponseDto> result = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Category Success!", result));
    }

    // Get products by shop
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByShop(@PathVariable UUID shopId) {
        List<ProductResponseDto> result = productService.getProductsByShop(shopId);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Shop Success!", result));
    }

    // Get products by status
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> getProductsByStatus(@PathVariable Status status) {
        List<ProductResponseDto> result = productService.getProductsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Get Products by Status Success!", result));
    }

    // Search products by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> searchProductsByName(@RequestParam String name) {
        List<ProductResponseDto> result = productService.searchProductsByName(name);
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

    // Update product with images
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProductWithImages(
            @PathVariable UUID id,
            @RequestParam("productData") String productDataJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> imageFiles) {
        
        try {
            ProductResponseDto result = productService.updateProductWithImages(id, productDataJson, imageFiles);
            return ResponseEntity.ok(ApiResponse.success("Update Product Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update product: " + e.getMessage()));
        }
    }

    // Update product without images
    @PutMapping("/update-simple/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateSimpleProduct(
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

    // Delete product
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
}