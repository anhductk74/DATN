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
    
    // Địa chỉ trụ sở
    private String street;
    private String commune;
    private String district;
    private String city;
    
    private ShippingCompanyStatus status;
}
