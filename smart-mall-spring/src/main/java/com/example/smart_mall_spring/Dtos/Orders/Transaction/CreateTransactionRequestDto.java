package com.example.smart_mall_spring.Dtos.Orders.Transaction;
import lombok.Data;
import java.sql.Date;

@Data
public class CreateTransactionRequestDto {
    private Double amount;
    private String description;
    private Integer transactionType;
    private String transactionCode;
    private Date transactionDate;
    private Integer status;
    private String bankTransactionName;
}