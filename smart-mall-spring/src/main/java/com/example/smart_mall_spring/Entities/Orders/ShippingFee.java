package com.example.smart_mall_spring.Entities.Orders;


import com.example.smart_mall_spring.Entities.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShippingFee extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String shippingMethod; // GHN, GHTK, Shopee Express...
    private Double feeAmount;
    private LocalDateTime estimatedDeliveryDate;
}
