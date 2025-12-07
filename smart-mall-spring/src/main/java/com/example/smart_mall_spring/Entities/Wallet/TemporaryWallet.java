package com.example.smart_mall_spring.Entities.Wallet;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Shop;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "temporary_wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TemporaryWallet extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @JsonIgnore
    private Shop shop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;
    
    @Column(nullable = false)
    private Double amount; // Số tiền từ đơn hàng
    
    @Column(name = "is_transferred", nullable = false)
    private Boolean isTransferred = false; // Đã chuyển sang ví chính chưa
    
    @Column(name = "transferred_at")
    private java.time.LocalDateTime transferredAt; // Thời gian chuyển
    
    @Column(length = 1000)
    private String note; // Ghi chú
}
