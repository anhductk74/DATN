package com.example.smart_mall_spring.Services.Wishlists;

import com.example.smart_mall_spring.Dtos.Categories.CategoryResponseDto;
import com.example.smart_mall_spring.Dtos.Products.ProductResponseDto;
import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Dtos.Wishlists.AddToWishlistDto;
import com.example.smart_mall_spring.Dtos.Wishlists.PagedWishlistResponseDto;
import com.example.smart_mall_spring.Dtos.Wishlists.WishlistItemDto;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Wishlist;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Repositories.WishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WishlistService {
    
    @Autowired
    private WishlistRepository wishlistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Thêm sản phẩm vào wishlist
     */
    @Transactional
    public WishlistItemDto addToWishlist(UUID userId, AddToWishlistDto dto) {
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Kiểm tra product tồn tại
        Product product = productRepository.findById(dto.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Kiểm tra xem đã tồn tại trong wishlist chưa
        if (wishlistRepository.existsByUserIdAndProductId(userId, dto.getProductId())) {
            throw new RuntimeException("Product already in wishlist");
        }
        
        // Tạo wishlist mới
        Wishlist wishlist = Wishlist.builder()
            .user(user)
            .product(product)
            .note(dto.getNote())
            .build();
        
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        
        return mapToWishlistItemDto(savedWishlist);
    }
    
    /**
     * Lấy tất cả wishlist của user (không phân trang)
     */
    public List<WishlistItemDto> getUserWishlist(UUID userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        return wishlists.stream()
            .map(this::mapToWishlistItemDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy wishlist của user với phân trang
     */
    public PagedWishlistResponseDto getUserWishlistWithPagination(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Wishlist> wishlistPage = wishlistRepository.findByUserIdWithPagination(userId, pageable);
        
        List<WishlistItemDto> items = wishlistPage.getContent().stream()
            .map(this::mapToWishlistItemDto)
            .collect(Collectors.toList());
        
        return PagedWishlistResponseDto.builder()
            .items(items)
            .currentPage(wishlistPage.getNumber())
            .totalPages(wishlistPage.getTotalPages())
            .totalItems(wishlistPage.getTotalElements())
            .pageSize(wishlistPage.getSize())
            .hasNext(wishlistPage.hasNext())
            .hasPrevious(wishlistPage.hasPrevious())
            .build();
    }
    
    /**
     * Xóa sản phẩm khỏi wishlist
     */
    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        
        wishlistRepository.delete(wishlist);
    }
    
    /**
     * Xóa tất cả wishlist của user
     */
    @Transactional
    public void clearWishlist(UUID userId) {
        wishlistRepository.deleteAllByUserId(userId);
    }
    
    /**
     * Kiểm tra sản phẩm có trong wishlist không
     */
    public boolean isInWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    /**
     * Đếm số lượng wishlist items của user
     */
    public long getWishlistCount(UUID userId) {
        return wishlistRepository.countByUserId(userId);
    }
    
    /**
     * Cập nhật note của wishlist item
     */
    @Transactional
    public WishlistItemDto updateNote(UUID userId, UUID productId, String note) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        
        wishlist.setNote(note);
        Wishlist updatedWishlist = wishlistRepository.save(wishlist);
        
        return mapToWishlistItemDto(updatedWishlist);
    }
    
    /**
     * Map Wishlist entity to WishlistItemDto
     */
    private WishlistItemDto mapToWishlistItemDto(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        
        // Map Category
        CategoryResponseDto categoryDto = null;
        if (product.getCategory() != null) {
            categoryDto = CategoryResponseDto.builder()
                .id(product.getCategory().getId())
                .name(product.getCategory().getName())
                .description(product.getCategory().getDescription())
                .status(product.getCategory().getStatus())
                .build();
        }
        
        // Map Shop
        ShopResponseDto shopDto = null;
        if (product.getShop() != null) {
            shopDto = ShopResponseDto.builder()
                .id(product.getShop().getId())
                .name(product.getShop().getName())
                .description(product.getShop().getDescription())
                .avatar(product.getShop().getAvatar())
                .viewCount(product.getShop().getViewCount())
                .build();
        }
        
        ProductResponseDto productDto = ProductResponseDto.builder()
            .id(product.getId())
            .name(product.getName())
            .description(product.getDescription())
            .brand(product.getBrand())
            .images(product.getImages())
            .status(product.getStatus())
            .isDeleted(product.getIsDeleted())
            .category(categoryDto)
            .shop(shopDto)
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
        
        return WishlistItemDto.builder()
            .wishlistId(wishlist.getId())
            .product(productDto)
            .note(wishlist.getNote())
            .addedAt(wishlist.getCreatedAt())
            .build();
    }
}
