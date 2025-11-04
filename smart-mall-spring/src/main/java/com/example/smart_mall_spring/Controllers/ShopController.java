package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Shop.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shop")
public class ShopController {
    @Autowired
    public final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ShopResponseDto>> createShop(
            @RequestParam("shopData") String shopDataJson,
            @RequestParam("image") MultipartFile imageFile) {
        
        try {
            ShopResponseDto result = shopService.createShop(shopDataJson, imageFile);
            return ResponseEntity.ok(ApiResponse.success("Create Shop Success!", result));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create shop: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShopResponseDto>> getShopById(@PathVariable UUID id) {
        // Tự động tăng view count khi xem shop
        try {
            shopService.incrementViewCount(id);
        } catch (Exception e) {
            // Không ngừng process nếu việc tăng view count thất bại
            System.err.println("Failed to increment view count: " + e.getMessage());
        }
        return ResponseEntity.ok(ApiResponse.success("Get Shop Success!", shopService.getShopById(id)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ShopResponseDto>>> getAllShops() {
        return ResponseEntity.ok(ApiResponse.success("Get All Shops Success!", shopService.getAllShops()));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ShopResponseDto>> updateShop(
            @PathVariable UUID id,
            @RequestParam("shopData") String shopDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        
        try {
            ShopResponseDto result = shopService.updateShopWithImage(id, shopDataJson, imageFile);
            return ResponseEntity.ok(ApiResponse.success("Update Shop Success!", result));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update shop: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteShop(@PathVariable UUID id) {
        shopService.deleteShop(id);
        return ResponseEntity.ok(ApiResponse.success("Delete Shop Success!", "Shop deleted successfully"));
    }

    // Get shops by owner ID (UUID user)
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<ShopResponseDto>>> getShopsByOwnerId(@PathVariable UUID ownerId) {
        try {
            List<ShopResponseDto> result = shopService.getShopsByOwnerId(ownerId);
            return ResponseEntity.ok(ApiResponse.success("Get Shops by Owner Success!", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get shops by owner: " + e.getMessage()));
        }
    }

    // Search shops by name
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ShopResponseDto>>> searchShopsByName(@RequestParam String name) {
        List<ShopResponseDto> result = shopService.searchShopsByName(name);
        return ResponseEntity.ok(ApiResponse.success("Search Shops Success!", result));
    }

    // Search shops by owner and name
    @GetMapping("/owner/{ownerId}/search")
    public ResponseEntity<ApiResponse<List<ShopResponseDto>>> searchShopsByOwnerAndName(
            @PathVariable UUID ownerId, 
            @RequestParam String name) {
        List<ShopResponseDto> result = shopService.searchShopsByOwnerAndName(ownerId, name);
        return ResponseEntity.ok(ApiResponse.success("Search Shops by Owner and Name Success!", result));
    }

    // Get shop count by owner
    @GetMapping("/owner/{ownerId}/count")
    public ResponseEntity<ApiResponse<Long>> getShopCountByOwner(@PathVariable UUID ownerId) {
        long count = shopService.getShopCountByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Get Shop Count by Owner Success!", count));
    }
    
    // Increment shop view count
    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> incrementShopViewCount(@PathVariable UUID id) {
        try {
            shopService.incrementViewCount(id);
            return ResponseEntity.ok(ApiResponse.success("View Count Incremented!", "Shop view count has been increased"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to increment view count: " + e.getMessage()));
        }
    }
    
    // Get shop view count
    @GetMapping("/{id}/view-count")
    public ResponseEntity<ApiResponse<Long>> getShopViewCount(@PathVariable UUID id) {
        try {
            Long viewCount = shopService.getShopViewCount(id);
            return ResponseEntity.ok(ApiResponse.success("Get Shop View Count Success!", viewCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get view count: " + e.getMessage()));
        }
    }
}
