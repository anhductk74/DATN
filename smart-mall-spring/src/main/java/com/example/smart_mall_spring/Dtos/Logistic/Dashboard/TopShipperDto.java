package com.example.smart_mall_spring.Dtos.Logistic.Dashboard;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopShipperDto {
    private String shipperName;
    private BigDecimal totalCod;
    private BigDecimal totalBalance;
}
