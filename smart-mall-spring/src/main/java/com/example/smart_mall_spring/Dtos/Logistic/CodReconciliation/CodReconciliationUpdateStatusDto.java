package com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation;

import com.example.smart_mall_spring.Enum.ReconciliationStatus;
import lombok.Data;

@Data
public class CodReconciliationUpdateStatusDto {
    private ReconciliationStatus status;
}
