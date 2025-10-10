package com.example.smart_mall_spring.Dtos.Carts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCartItemDto {
    private UUID cartItemId;
    private Integer quantity;
}