package com.example.smart_mall_spring.Entities.Logistics;

import com.example.smart_mall_spring.Entities.BaseEntity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipper_balance_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipperBalanceHistory extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "shipper_id")
    @JsonIgnore
    private Shipper shipper;

    private BigDecimal openingBalance;   // công nợ đầu ngày
    private BigDecimal collected;        // tổng thu COD
    private BigDecimal deposited;        // tổng nộp COD
    private BigDecimal bonus;            // tổng bonus
    private BigDecimal finalBalance;     // công nợ cuối ngày
    private LocalDateTime date;
}