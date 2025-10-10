package com.example.smart_mall_spring.Services.Orders;

import com.example.smart_mall_spring.Dtos.Orders.*;
import com.example.smart_mall_spring.Dtos.Products.ProductVariantDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserAddress;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Exception.ResourceNotFoundException;
import com.example.smart_mall_spring.Repositories.OrderItemRepository;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Repositories.ProductVariantRepository;
import com.example.smart_mall_spring.Repositories.UserAddressRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserAddressRepository userAddressRepository;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;
    
    public OrderResponseDto createOrder(UUID userId, CreateOrderDto createOrderDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserAddress shippingAddress = userAddressRepository.findById(createOrderDto.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found"));
        
        // Verify that the address belongs to the user
        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to address");
        }
        
        Order order = new Order();
        order.setUser(user);
        order.setStatus(StatusOrder.PENDING);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(createOrderDto.getPaymentMethod());
        
        double totalAmount = 0.0;
        Order savedOrder = orderRepository.save(order);
        
        for (CreateOrderDto.OrderItemDto itemDto : createOrderDto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDto.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));
            
            // Check stock availability
            if (variant.getStock() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + variant.getProduct().getName());
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setVariant(variant);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPrice(itemDto.getPrice());
            
            orderItemRepository.save(orderItem);
            
            // Update stock
            variant.setStock(variant.getStock() - itemDto.getQuantity());
            productVariantRepository.save(variant);
            
            totalAmount += itemDto.getPrice() * itemDto.getQuantity();
        }
        
        savedOrder.setTotalAmount(totalAmount);
        savedOrder = orderRepository.save(savedOrder);
        
        return convertToOrderResponseDto(savedOrder);
    }
    
    public Page<OrderResponseDto> getOrdersByUserId(UUID userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return orders.map(this::convertToOrderResponseDto);
    }
    
    public OrderResponseDto getOrderById(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Verify that the order belongs to the user
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        
        return convertToOrderResponseDto(order);
    }
    
    public OrderResponseDto updateOrderStatus(UUID orderId, UpdateOrderStatusDto updateOrderStatusDto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        order.setStatus(updateOrderStatusDto.getStatus());
        Order savedOrder = orderRepository.save(order);
        
        return convertToOrderResponseDto(savedOrder);
    }
    
    public void cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Verify that the order belongs to the user
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        
        // Only allow cancellation if order is pending or paid
        if (order.getStatus() != StatusOrder.PENDING && order.getStatus() != StatusOrder.PAID) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            variant.setStock(variant.getStock() + item.getQuantity());
            productVariantRepository.save(variant);
        }
        
        order.setStatus(StatusOrder.CANCELLED);
        orderRepository.save(order);
    }
    
    public Page<OrderResponseDto> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return orders.map(this::convertToOrderResponseDto);
    }
    
    private OrderResponseDto convertToOrderResponseDto(Order order) {
        List<OrderItemResponseDto> items = order.getItems().stream()
                .map(this::convertToOrderItemResponseDto)
                .collect(Collectors.toList());
        
        return OrderResponseDto.builder()
                .id(order.getId())
                .user(convertToUserInfoDto(order.getUser()))
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(convertToAddressResponseDto(order.getShippingAddress()))
                .paymentMethod(order.getPaymentMethod())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    private OrderItemResponseDto convertToOrderItemResponseDto(OrderItem orderItem) {
        ProductVariantDto variantDto = convertToProductVariantDto(orderItem.getVariant());
        double subtotal = orderItem.getQuantity() * orderItem.getPrice();
        
        String productName = orderItem.getVariant().getProduct().getName();
        String productImage = null;
        if (orderItem.getVariant().getProduct().getImages() != null && !orderItem.getVariant().getProduct().getImages().isEmpty()) {
            productImage = orderItem.getVariant().getProduct().getImages().get(0);
        }
        
        return OrderItemResponseDto.builder()
                .id(orderItem.getId())
                .variant(variantDto)
                .productName(productName)
                .productImage(productImage)
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .subtotal(subtotal)
                .createdAt(orderItem.getCreatedAt())
                .updatedAt(orderItem.getUpdatedAt())
                .build();
    }
    
    // These conversion methods would need to be implemented based on your existing DTOs
    private com.example.smart_mall_spring.Dtos.Auth.UserInfoDto convertToUserInfoDto(User user) {
        // Implementation depends on your UserInfoDto structure
        return null; // Placeholder
    }
    
    private com.example.smart_mall_spring.Dtos.Address.AddressResponseDto convertToAddressResponseDto(UserAddress address) {
        // Implementation depends on your AddressResponseDto structure
        return null; // Placeholder
    }
    
    private ProductVariantDto convertToProductVariantDto(ProductVariant variant) {
        List<com.example.smart_mall_spring.Dtos.Products.VariantAttributeDto> attributeDtos = null;
        if (variant.getAttributes() != null && !variant.getAttributes().isEmpty()) {
            attributeDtos = variant.getAttributes().stream()
                    .map(attr -> com.example.smart_mall_spring.Dtos.Products.VariantAttributeDto.builder()
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