package com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CodReconciliationRequestDto {
    private UUID shipperId;
    private LocalDate date; // optional, default = today
}
