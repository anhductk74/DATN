package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Wallet.WalletTransaction;
import com.example.smart_mall_spring.Enum.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {
    Page<WalletTransaction> findByWalletId(UUID walletId, Pageable pageable);
    Page<WalletTransaction> findByWalletIdAndType(UUID walletId, TransactionType type, Pageable pageable);
    
    @Query("SELECT w FROM WalletTransaction w WHERE w.wallet.id = :walletId ORDER BY w.createdAt DESC")
    Page<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(@Param("walletId") UUID walletId, Pageable pageable);
    
    @Query("SELECT w FROM WalletTransaction w WHERE w.wallet.id = :walletId AND w.createdAt BETWEEN :startDate AND :endDate ORDER BY w.createdAt DESC")
    List<WalletTransaction> findByWalletIdAndDateRange(
        @Param("walletId") UUID walletId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Kiểm tra transaction đã tồn tại cho order chưa
    boolean existsByOrderId(UUID orderId);
}
