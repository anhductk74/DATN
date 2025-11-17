package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Wallet.WithdrawalRequest;
import com.example.smart_mall_spring.Enum.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, UUID> {
    Page<WithdrawalRequest> findByShopId(UUID shopId, Pageable pageable);
    Page<WithdrawalRequest> findByStatus(WithdrawalStatus status, Pageable pageable);
    List<WithdrawalRequest> findByShopIdAndStatus(UUID shopId, WithdrawalStatus status);
    
    @Query("SELECT w FROM WithdrawalRequest w WHERE w.shop.id = :shopId ORDER BY w.createdAt DESC")
    Page<WithdrawalRequest> findByShopIdOrderByCreatedAtDesc(@Param("shopId") UUID shopId, Pageable pageable);
    
    @Query("SELECT w FROM WithdrawalRequest w WHERE w.status = :status ORDER BY w.createdAt ASC")
    Page<WithdrawalRequest> findByStatusOrderByCreatedAtAsc(@Param("status") WithdrawalStatus status, Pageable pageable);
}
