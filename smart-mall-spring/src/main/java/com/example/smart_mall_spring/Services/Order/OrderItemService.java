package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Repositories.OrderItemRepository;
import com.example.smart_mall_spring.Repositories.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    public List<OrderItem> createOrderItems(Order order, List<OrderItemRequestDto> itemDtos) {
        return itemDtos.stream().map(dto -> {
            ProductVariant variant = productVariantRepository.findById(dto.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setVariant(variant);
            item.setQuantity(dto.getQuantity());
            item.setPrice(variant.getPrice()); // giá lấy từ variant
            return orderItemRepository.save(item);
        }).collect(Collectors.toList());
    }

    public List<OrderItemResponseDto> getOrderItemsByOrder(Long orderId) {
        return orderItemRepository.findByOrderId(orderId).stream().map(item ->
                new OrderItemResponseDto(
                        item.getId(),
                        item.getOrder().getId(),
                        item.getVariant().getId(),
                        item.getVariant().getProduct().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getQuantity() * item.getPrice()
                )
        ).collect(Collectors.toList());
    }
}
