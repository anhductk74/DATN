package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Wishlists.AddToWishlistDto;
import com.example.smart_mall_spring.Dtos.Wishlists.PagedWishlistResponseDto;
import com.example.smart_mall_spring.Dtos.Wishlists.WishlistItemDto;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Wishlists.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    
    @Autowired
    private WishlistService wishlistService;
    
    /**
     * Thêm sản phẩm vào wishlist
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WishlistItemDto>> addToWishlist(
            @RequestBody AddToWishlistDto dto) {
        try {
            UUID userId = getCurrentUserId();
            WishlistItemDto result = wishlistService.addToWishlist(userId, dto);
            return ResponseEntity.ok(
                ApiResponse.success("Product added to wishlist successfully", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to add to wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy tất cả wishlist của user (không phân trang)
     */
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getWishlist() {
        try {
            UUID userId = getCurrentUserId();
            List<WishlistItemDto> result = wishlistService.getUserWishlist(userId);
            return ResponseEntity.ok(
                ApiResponse.success("Get wishlist successfully", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy wishlist của user với phân trang
     */
    @GetMapping("/paged")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedWishlistResponseDto>> getWishlistPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            UUID userId = getCurrentUserId();
            PagedWishlistResponseDto result = wishlistService.getUserWishlistWithPagination(userId, page, size);
            return ResponseEntity.ok(
                ApiResponse.success("Get wishlist successfully", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * Xóa sản phẩm khỏi wishlist
     */
    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @PathVariable UUID productId) {
        try {
            UUID userId = getCurrentUserId();
            wishlistService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok(
                ApiResponse.success("Product removed from wishlist successfully", 
                    "Product has been removed from your wishlist")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to remove from wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * Xóa tất cả wishlist
     */
    @DeleteMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> clearWishlist() {
        try {
            UUID userId = getCurrentUserId();
            wishlistService.clearWishlist(userId);
            return ResponseEntity.ok(
                ApiResponse.success("Wishlist cleared successfully", 
                    "All items have been removed from your wishlist")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to clear wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * Kiểm tra sản phẩm có trong wishlist không
     */
    @GetMapping("/check/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkInWishlist(
            @PathVariable UUID productId) {
        try {
            UUID userId = getCurrentUserId();
            boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
            return ResponseEntity.ok(
                ApiResponse.success("Check wishlist successfully", 
                    Map.of("inWishlist", isInWishlist))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to check wishlist: " + e.getMessage()));
        }
    }
    
    /**
     * Đếm số lượng wishlist items
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getWishlistCount() {
        try {
            UUID userId = getCurrentUserId();
            long count = wishlistService.getWishlistCount(userId);
            return ResponseEntity.ok(
                ApiResponse.success("Get wishlist count successfully", 
                    Map.of("count", count))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get wishlist count: " + e.getMessage()));
        }
    }
    
    /**
     * Cập nhật note của wishlist item
     */
    @PutMapping("/{productId}/note")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WishlistItemDto>> updateNote(
            @PathVariable UUID productId,
            @RequestBody Map<String, String> request) {
        try {
            UUID userId = getCurrentUserId();
            String note = request.get("note");
            WishlistItemDto result = wishlistService.updateNote(userId, productId, note);
            return ResponseEntity.ok(
                ApiResponse.success("Note updated successfully", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update note: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to get current user ID
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser().getId();
    }
}
