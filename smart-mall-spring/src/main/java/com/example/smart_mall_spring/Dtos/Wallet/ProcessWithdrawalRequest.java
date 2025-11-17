package com.example.smart_mall_spring.Dtos.Wallet;

import com.example.smart_mall_spring.Enum.WithdrawalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessWithdrawalRequest {
    
    @NotNull(message = "Trạng thái không được để trống")
    private WithdrawalStatus status; // APPROVED hoặc REJECTED
    
    private String adminNote;
}
