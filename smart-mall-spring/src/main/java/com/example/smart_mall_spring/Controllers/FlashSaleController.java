package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.FlashSale.*;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.FlashSale.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {
    
    private final FlashSaleService flashSaleService;
    
    /**
     * Create a new flash sale
     * POST /api/flash-sales
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FlashSaleResponseDto>> createFlashSale(
            @Valid @RequestBody CreateFlashSaleDto createDto) {
        try {
            FlashSaleResponseDto response = flashSaleService.createFlashSale(createDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Flash sale created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Update an existing flash sale
     * PUT /api/flash-sales/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlashSaleResponseDto>> updateFlashSale(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateFlashSaleDto updateDto) {
        try {
            FlashSaleResponseDto response = flashSaleService.updateFlashSale(id, updateDto);
            return ResponseEntity.ok(ApiResponse.success("Flash sale updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a flash sale (soft delete)
     * DELETE /api/flash-sales/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlashSale(@PathVariable UUID id) {
        try {
            flashSaleService.deleteFlashSale(id);
            return ResponseEntity.ok(ApiResponse.success("Flash sale deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Get flash sale by ID
     * GET /api/flash-sales/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlashSaleResponseDto>> getFlashSaleById(@PathVariable UUID id) {
        try {
            FlashSaleResponseDto response = flashSaleService.getFlashSaleById(id);
            return ResponseEntity.ok(ApiResponse.success("Flash sale retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Get all flash sales with pagination
     * GET /api/flash-sales?page=0&size=10&sortBy=startTime&sortDir=desc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FlashSaleResponseDto>>> getAllFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<FlashSaleResponseDto> response = flashSaleService.getAllFlashSales(page, size, sortBy, sortDir);
            return ResponseEntity.ok(ApiResponse.success("Flash sales retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get flash sales: " + e.getMessage()));
        }
    }
    
    /**
     * Get active flash sales (currently running)
     * GET /api/flash-sales/active?page=0&size=10
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Page<FlashSaleResponseDto>>> getActiveFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FlashSaleResponseDto> response = flashSaleService.getActiveFlashSales(page, size);
            return ResponseEntity.ok(ApiResponse.success("Active flash sales retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get active flash sales: " + e.getMessage()));
        }
    }
    
    /**
     * Get upcoming flash sales (not started yet)
     * GET /api/flash-sales/upcoming?page=0&size=10
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<Page<FlashSaleResponseDto>>> getUpcomingFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FlashSaleResponseDto> response = flashSaleService.getUpcomingFlashSales(page, size);
            return ResponseEntity.ok(ApiResponse.success("Upcoming flash sales retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get upcoming flash sales: " + e.getMessage()));
        }
    }
    
    /**
     * Get flash sales by shop
     * GET /api/flash-sales/shop/{shopId}?page=0&size=10
     */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<ApiResponse<Page<FlashSaleResponseDto>>> getFlashSalesByShop(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FlashSaleResponseDto> response = flashSaleService.getFlashSalesByShop(shopId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Flash sales retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get flash sales by shop: " + e.getMessage()));
        }
    }
    
    /**
     * Get flash sales by status
     * GET /api/flash-sales/status/{status}?page=0&size=10
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<FlashSaleResponseDto>>> getFlashSalesByStatus(
            @PathVariable Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FlashSaleResponseDto> response = flashSaleService.getFlashSalesByStatus(status, page, size);
            return ResponseEntity.ok(ApiResponse.success("Flash sales retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get flash sales by status: " + e.getMessage()));
        }
    }
    
    /**
     * Search flash sales by name
     * GET /api/flash-sales/search?keyword=summer&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FlashSaleResponseDto>>> searchFlashSales(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FlashSaleResponseDto> response = flashSaleService.searchFlashSales(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("Flash sales search completed", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to search flash sales: " + e.getMessage()));
        }
    }
    
    /**
     * Approve a flash sale (Admin only)
     * PUT /api/flash-sales/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<FlashSaleResponseDto>> approveFlashSale(@PathVariable UUID id) {
        try {
            FlashSaleResponseDto response = flashSaleService.approveFlashSale(id);
            return ResponseEntity.ok(ApiResponse.success("Flash sale approved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to approve flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Reject a flash sale (Admin only)
     * PUT /api/flash-sales/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<FlashSaleResponseDto>> rejectFlashSale(@PathVariable UUID id) {
        try {
            FlashSaleResponseDto response = flashSaleService.rejectFlashSale(id);
            return ResponseEntity.ok(ApiResponse.success("Flash sale rejected successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to reject flash sale: " + e.getMessage()));
        }
    }
    
    /**
     * Get all items in a flash sale
     * GET /api/flash-sales/{id}/items
     */
    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<FlashSaleItemResponseDto>>> getFlashSaleItems(
            @PathVariable UUID id) {
        try {
            List<FlashSaleItemResponseDto> response = flashSaleService.getFlashSaleItems(id);
            return ResponseEntity.ok(ApiResponse.success("Flash sale items retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get flash sale items: " + e.getMessage()));
        }
    }
}
