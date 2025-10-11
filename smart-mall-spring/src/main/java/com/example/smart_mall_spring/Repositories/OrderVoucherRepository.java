package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.OrderVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderVoucherRepository extends JpaRepository<OrderVoucher, UUID> {

    @Query("SELECT ov FROM OrderVoucher ov WHERE ov.order.id = :orderId")
    List<OrderVoucher> findByOrderId(UUID orderId);

    @Query("SELECT ov FROM OrderVoucher ov WHERE ov.voucher.id = :voucherId")
    List<OrderVoucher> findByVoucherId(UUID voucherId);
}
