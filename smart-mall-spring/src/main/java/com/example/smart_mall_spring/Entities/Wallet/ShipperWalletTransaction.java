package com.example.smart_mall_spring.Entities.Wallet;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shipper_wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipperWalletTransaction extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private ShipperWallet wallet;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipperTransactionType type;
    
    @Column(nullable = false)
    private Double amount; // Số tiền giao dịch (+ hoặc -)
    
    @Column(nullable = false)
    private Double balanceBefore; // Số dư trước giao dịch
    
    @Column(nullable = false)
    private Double balanceAfter; // Số dư sau giao dịch
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order; // Liên kết đến đơn hàng (nếu có)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "withdrawal_request_id")
    @JsonIgnore
    private ShipperWithdrawalRequest withdrawalRequest; // Liên kết đến yêu cầu rút tiền (nếu có)
    
    @Column(length = 1000)
    private String description; // Mô tả giao dịch
    
    @Column(name = "reference_code")
    private String referenceCode; // Mã tham chiếu
}
