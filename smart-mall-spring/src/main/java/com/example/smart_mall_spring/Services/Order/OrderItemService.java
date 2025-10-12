package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Repositories.OrderItemRepository;
import com.example.smart_mall_spring.Repositories.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;

    // Tạo order items từ request DTO
    public List<OrderItemResponseDto> createOrderItems(Order order, List<OrderItemRequestDto> itemDtos) {
        return itemDtos.stream().map(dto -> {
            ProductVariant variant = productVariantRepository.findById(dto.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setVariant(variant);
            item.setQuantity(dto.getQuantity());
            item.setPrice(variant.getPrice()); // giá lấy từ variant

            OrderItem savedItem = orderItemRepository.save(item);

            // Map entity -> DTO
            return OrderItemResponseDto.builder()
                    .id(savedItem.getId())
                    .orderId(order.getId())
                    .variant(savedItem.getVariant().toDto()) // giả sử ProductVariant có method toDto()
                    .productName(savedItem.getVariant().getProduct().getName())
                    .productImage(
                            savedItem.getVariant().getProduct().getImages() != null &&
                                    !savedItem.getVariant().getProduct().getImages().isEmpty()
                                    ? savedItem.getVariant().getProduct().getImages().get(0)
                                    : null
                    )
                    .quantity(savedItem.getQuantity())
                    .price(savedItem.getPrice())
                    .subtotal(savedItem.getPrice() * savedItem.getQuantity())
                    .createdAt(savedItem.getCreatedAt())
                    .updatedAt(savedItem.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    // Lấy order items theo orderId
    public List<OrderItemResponseDto> getOrderItemsByOrder(Long orderId) {
        return orderItemRepository.findByOrderId(orderId).stream().map(item ->
                OrderItemResponseDto.builder()
                        .id(item.getId())
                        .orderId(item.getOrder().getId())
                        .variant(item.getVariant().toDto())
                        .productName(item.getVariant().getProduct().getName())
                        .productImage(
                                item.getVariant().getProduct().getImages() != null &&
                                        !item.getVariant().getProduct().getImages().isEmpty()
                                        ? item.getVariant().getProduct().getImages().get(0)
                                        : null
                        )
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice() * item.getQuantity())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .build()
        ).collect(Collectors.toList());
    }
}
