package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Shop.CreateShopDto;
import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Dtos.Shop.UpdateShopDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Shop.ShopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ShopResponseDto>> createShop(@Valid @RequestBody CreateShopDto createShopDto){
        return ResponseEntity.ok(ApiResponse.success("Create Shop Success!",shopService.createShop(createShopDto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShopResponseDto>> getShopById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Get Shop Success!", shopService.getShopById(id)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ShopResponseDto>>> getAllShops() {
        return ResponseEntity.ok(ApiResponse.success("Get All Shops Success!", shopService.getAllShops()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShopResponseDto>> updateShop(@PathVariable UUID id, @Valid @RequestBody UpdateShopDto updateShopDto) {
        return ResponseEntity.ok(ApiResponse.success("Update Shop Success!", shopService.updateShop(id, updateShopDto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteShop(@PathVariable UUID id) {
        shopService.deleteShop(id);
        return ResponseEntity.ok(ApiResponse.success("Delete Shop Success!", "Shop deleted successfully"));
    }
}
