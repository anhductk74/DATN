package com.example.smart_mall_spring.Repositories;
import com.example.smart_mall_spring.Entities.Orders.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Lấy danh sách giao dịch của người dùng
    List<Transaction> findByUserId(UUID userId);

    // Tìm theo mã giao dịch (dùng để kiểm tra refund hoặc trùng)
    Optional<Transaction> findByTransactionCode(String transactionCode);

    // Kiểm tra đã tồn tại giao dịch này chưa (tránh xử lý lại callback)
    boolean existsByTransactionCode(String transactionCode);
}