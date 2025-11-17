package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Wallet.TemporaryWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemporaryWalletRepository extends JpaRepository<TemporaryWallet, UUID> {
    
    // Tìm tất cả ví tạm chưa chuyển của một shop
    List<TemporaryWallet> findByShopIdAndIsTransferredFalse(UUID shopId);
    
    // Tính tổng số tiền trong ví tạm của shop
    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM TemporaryWallet t WHERE t.shop.id = :shopId AND t.isTransferred = false")
    Double getTotalTemporaryAmount(@Param("shopId") UUID shopId);
    
    // Đếm số lượng giao dịch tạm
    Long countByShopIdAndIsTransferredFalse(UUID shopId);
    
    // Kiểm tra đơn hàng đã có trong ví tạm chưa
    boolean existsByOrderId(UUID orderId);
}
