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
}
