package com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest;


import com.example.smart_mall_spring.Entities.Orders.OrderReturnRequest;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class OrderReturnMapper {

    public OrderReturnResponseDto toResponseDto(OrderReturnRequest entity) {
        OrderReturnResponseDto dto = new OrderReturnResponseDto();
        dto.setId(entity.getId());
        dto.setOrderId(entity.getOrder().getId());
        dto.setUserName(entity.getUser().getProfile().getFullName());
        dto.setUserId(entity.getUser().getId());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus().name());
        dto.setRequestDate(entity.getRequestDate());
        dto.setProcessedDate(entity.getProcessedDate());
        dto.setImageUrls(entity.getImages()
                .stream()
                .map(img -> img.getUrl())
                .collect(Collectors.toList()));
        return dto;
    }
}