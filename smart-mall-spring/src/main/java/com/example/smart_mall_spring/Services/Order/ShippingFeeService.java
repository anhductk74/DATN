package com.example.smart_mall_spring.Services.Order;


import com.example.smart_mall_spring.Dtos.Orders.ShippingFee.ShippingFeeRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.ShippingFee.ShippingFeeResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.ShippingFee;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Repositories.ShippingFeeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShippingFeeService {

    private final ShippingFeeRepository shippingFeeRepository;
    private final OrderRepository orderRepository;

    //  Tạo mới phí vận chuyển
    public ShippingFeeResponseDto createShippingFee(ShippingFeeRequestDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        shippingFeeRepository.findByOrderId(order.getId())
                .ifPresent(s -> { throw new RuntimeException("Shipping fee already exists for this order"); });

        ShippingFee shippingFee = new ShippingFee();
        shippingFee.setOrder(order);
        shippingFee.setShippingMethod(dto.getShippingMethod());
        shippingFee.setFeeAmount(dto.getFeeAmount());
        shippingFee.setEstimatedDeliveryDate(dto.getEstimatedDeliveryDate());

        shippingFeeRepository.save(shippingFee);

        // Cập nhật tổng tiền đơn hàng
        order.setShippingFee(dto.getFeeAmount());
        orderRepository.save(order);

        return toResponse(shippingFee);
    }

    //  Lấy phí vận chuyển theo đơn hàng
    public ShippingFeeResponseDto getShippingFeeByOrder(UUID orderId) {
        ShippingFee shippingFee = shippingFeeRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping fee not found"));
        return toResponse(shippingFee);
    }

    //  Cập nhật phí vận chuyển
    public ShippingFeeResponseDto updateShippingFee(UUID orderId, ShippingFeeRequestDto dto) {
        ShippingFee shippingFee = shippingFeeRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping fee not found"));

        shippingFee.setShippingMethod(dto.getShippingMethod());
        shippingFee.setFeeAmount(dto.getFeeAmount());
        shippingFee.setEstimatedDeliveryDate(dto.getEstimatedDeliveryDate());

        shippingFeeRepository.save(shippingFee);

        shippingFee.getOrder().setShippingFee(dto.getFeeAmount());
        orderRepository.save(shippingFee.getOrder());

        return toResponse(shippingFee);
    }

    private ShippingFeeResponseDto toResponse(ShippingFee shippingFee) {
        return ShippingFeeResponseDto.builder()
                .id(shippingFee.getId())
                .orderId(shippingFee.getOrder().getId())
                .shippingMethod(shippingFee.getShippingMethod())
                .feeAmount(shippingFee.getFeeAmount())
                .estimatedDeliveryDate(shippingFee.getEstimatedDeliveryDate())
                .build();
    }
}