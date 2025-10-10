package com.example.smart_mall_spring.Services.Carts;

import com.example.smart_mall_spring.Dtos.Carts.*;
import com.example.smart_mall_spring.Dtos.Products.ProductVariantDto;
import com.example.smart_mall_spring.Dtos.Products.VariantAttributeDto;
import com.example.smart_mall_spring.Entities.Carts.Cart;
import com.example.smart_mall_spring.Entities.Carts.CartItem;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Exception.ResourceNotFoundException;
import com.example.smart_mall_spring.Repositories.CartItemRespository;
import com.example.smart_mall_spring.Repositories.CartRepository;
import com.example.smart_mall_spring.Repositories.ProductVariantRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRespository cartItemRepository;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public CartResponseDto getCartByUserId(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        
        return convertToCartResponseDto(cart);
    }
    
    public CartResponseDto addToCart(UUID userId, AddToCartDto addToCartDto) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
        
        ProductVariant variant = productVariantRepository.findById(addToCartDto.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId())
                .orElse(null);
        
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + addToCartDto.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setVariant(variant);
            newItem.setQuantity(addToCartDto.getQuantity());
            cartItemRepository.save(newItem);
        }
        
        return getCartByUserId(userId);
    }
    
    public CartResponseDto updateCartItem(UUID userId, UpdateCartItemDto updateCartItemDto) {
        CartItem cartItem = cartItemRepository.findById(updateCartItemDto.getCartItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify that the cart item belongs to the user
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }
        
        if (updateCartItemDto.getQuantity() <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(updateCartItemDto.getQuantity());
            cartItemRepository.save(cartItem);
        }
        
        return getCartByUserId(userId);
    }
    
    public void removeFromCart(UUID userId, UUID cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify that the cart item belongs to the user
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to cart item");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    public void clearCart(UUID userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        cartItemRepository.deleteByCartId(cart.getId());
    }
    
    private Cart createCartForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }
    
    private CartResponseDto convertToCartResponseDto(Cart cart) {
        List<CartItemResponseDto> items = new ArrayList<>();
        
        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            items = cart.getItems().stream()
                    .map(this::convertToCartItemResponseDto)
                    .collect(Collectors.toList());
        }
        
        double totalAmount = items.stream()
                .mapToDouble(CartItemResponseDto::getSubtotal)
                .sum();
        
        int totalItems = items.stream()
                .mapToInt(CartItemResponseDto::getQuantity)
                .sum();
        
        return CartResponseDto.builder()
                .id(cart.getId())
                .items(items)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
    
    private CartItemResponseDto convertToCartItemResponseDto(CartItem cartItem) {
        ProductVariantDto variantDto = convertToProductVariantDto(cartItem.getVariant());
        double subtotal = cartItem.getQuantity() * cartItem.getVariant().getPrice();
        
        String productName = cartItem.getVariant().getProduct().getName();
        String productImage = null;
        if (cartItem.getVariant().getProduct().getImages() != null && !cartItem.getVariant().getProduct().getImages().isEmpty()) {
            productImage = cartItem.getVariant().getProduct().getImages().get(0);
        }
        
        return CartItemResponseDto.builder()
                .id(cartItem.getId())
                .variant(variantDto)
                .productName(productName)
                .productImage(productImage)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .createdAt(cartItem.getCreatedAt())
                .updatedAt(cartItem.getUpdatedAt())
                .build();
    }
    
    private ProductVariantDto convertToProductVariantDto(ProductVariant variant) {
        List<VariantAttributeDto> attributeDtos = null;
        if (variant.getAttributes() != null && !variant.getAttributes().isEmpty()) {
            attributeDtos = variant.getAttributes().stream()
                    .map(attr -> VariantAttributeDto.builder()
                            .id(attr.getId())
                            .name(attr.getAttributeName())
                            .value(attr.getAttributeValue())
                            .build())
                    .collect(Collectors.toList());
        }
        
        return ProductVariantDto.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stock(variant.getStock())
                .weight(variant.getWeight())
                .dimensions(variant.getDimensions())
                .attributes(attributeDtos)
                .productName(variant.getProduct().getName())
                .productBrand(variant.getProduct().getBrand())
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }
}