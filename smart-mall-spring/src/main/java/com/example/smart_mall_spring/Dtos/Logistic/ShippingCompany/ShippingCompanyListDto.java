package com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany;

import com.example.smart_mall_spring.Enum.ShippingCompanyStatus;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingCompanyListDto {
    private UUID id;
    private String name;
    private String code;
    private ShippingCompanyStatus status;
}
