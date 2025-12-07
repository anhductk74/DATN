package com.example.smart_mall_spring.Entities.Wallet;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Enum.WithdrawalStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shipper_withdrawal_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShipperWithdrawalRequest extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipper_id", nullable = false)
    @JsonIgnore
    private Shipper shipper;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnore
    private ShipperWallet wallet;
    
    @Column(nullable = false)
    private Double amount; // Số tiền yêu cầu rút
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WithdrawalStatus status = WithdrawalStatus.PENDING;
    
    @Column(name = "bank_name", nullable = false)
    private String bankName;
    
    @Column(name = "bank_account_number", nullable = false)
    private String bankAccountNumber;
    
    @Column(name = "bank_account_name", nullable = false)
    private String bankAccountName;
    
    @Column(length = 1000)
    private String note; // Ghi chú của shipper
    
    @Column(name = "admin_note", length = 1000)
    private String adminNote; // Ghi chú của admin khi xử lý
    
    @Column(name = "processed_by")
    private String processedBy; // Username của admin xử lý
    
    @Column(name = "processed_at")
    private java.time.LocalDateTime processedAt; // Thời gian xử lý
}
