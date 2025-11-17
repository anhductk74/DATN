package com.example.smart_mall_spring.Dtos.Wallet;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequestDto {
    
    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 50000, message = "Số tiền rút tối thiểu là 50,000 VNĐ")
    private Double amount;
    
    @NotBlank(message = "Tên ngân hàng không được để trống")
    private String bankName;
    
    @NotBlank(message = "Số tài khoản không được để trống")
    private String bankAccountNumber;
    
    @NotBlank(message = "Tên chủ tài khoản không được để trống")
    private String bankAccountName;
    
    private String note;
}
