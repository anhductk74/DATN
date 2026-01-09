package com.example.smart_mall_spring.Dtos.Dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Top performing shop data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopShopDto {
    private UUID shopId;
    private String shopName;
    private String shopAvatar;
    private Double revenue;
    private Long orderCount;
    private Double rating;
    private Long reviewCount;
}
