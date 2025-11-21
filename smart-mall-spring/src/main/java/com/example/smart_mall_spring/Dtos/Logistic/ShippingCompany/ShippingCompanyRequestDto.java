package com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany;
import com.example.smart_mall_spring.Enum.ShippingCompanyStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingCompanyRequestDto {
    private String name;
    private String code;
    private String contactEmail;
    private String contactPhone;
    private String headquartersAddress;
    private ShippingCompanyStatus status;
}
