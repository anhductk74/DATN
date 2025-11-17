package com.example.smart_mall_spring.Entities.Wallet;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Enum.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WalletTransaction extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private ShopWallet wallet;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    @Column(nullable = false)
    private Double amount; // Số tiền giao dịch (+ hoặc -)
    
    @Column(nullable = false)
    private Double balanceBefore; // Số dư trước giao dịch
    
    @Column(nullable = false)
    private Double balanceAfter; // Số dư sau giao dịch
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // Liên kết đến đơn hàng (nếu có)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "withdrawal_request_id")
    private WithdrawalRequest withdrawalRequest; // Liên kết đến yêu cầu rút tiền (nếu có)
    
    @Column(length = 1000)
    private String description; // Mô tả giao dịch
    
    @Column(name = "reference_code")
    private String referenceCode; // Mã tham chiếu
}
