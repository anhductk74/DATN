package com.example.smart_mall_spring.Entities.Wallet;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Shop;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shop_wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShopWallet extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false, unique = true)
    private Shop shop;
    
    @Column(nullable = false)
    private Double balance = 0.0; // Số dư hiện tại
    
    @Column(nullable = false)
    private Double totalEarned = 0.0; // Tổng tiền đã kiếm được
    
    @Column(nullable = false)
    private Double totalWithdrawn = 0.0; // Tổng tiền đã rút
    
    @Column(nullable = false)
    private Double pendingAmount = 0.0; // Số tiền đang chờ xử lý (đơn hàng chưa hoàn thành)
    
    @Column(name = "bank_name")
    private String bankName; // Tên ngân hàng
    
    @Column(name = "bank_account_number")
    private String bankAccountNumber; // Số tài khoản ngân hàng
    
    @Column(name = "bank_account_name")
    private String bankAccountName; // Tên chủ tài khoản
    
    @Column(name = "is_active")
    private Boolean isActive = true; // Trạng thái ví
}
