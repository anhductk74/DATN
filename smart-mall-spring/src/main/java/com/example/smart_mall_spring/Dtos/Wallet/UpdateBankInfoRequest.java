package com.example.smart_mall_spring.Dtos.Wallet;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBankInfoRequest {
    
    @NotBlank(message = "Tên ngân hàng không được để trống")
    private String bankName;
    
    @NotBlank(message = "Số tài khoản không được để trống")
    private String bankAccountNumber;
    
    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    private String bankAccountName;
}
