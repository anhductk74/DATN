package com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest;

import lombok.Data;

import java.util.UUID;

@Data
public class OrderReturnImageResponseDto {
    private UUID id;
    private String url;
    private String publicId;
}