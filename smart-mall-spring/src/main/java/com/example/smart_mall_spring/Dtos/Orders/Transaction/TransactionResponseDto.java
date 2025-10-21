package com.example.smart_mall_spring.Dtos.Orders.Transaction;

import lombok.Builder;
import lombok.Data;
import java.sql.Date;
import java.util.UUID;

@Data
@Builder
public class TransactionResponseDto {
    private UUID id;
    private String transactionCode;
    private Double amount;
    private String description;
    private Integer transactionType;
    private Date transactionDate;
    private Integer status;
    private String bankTransactionName;
    private UUID userId;
    private String userName;
}