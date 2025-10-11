package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.ShippingFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShippingFeeRepository extends JpaRepository<ShippingFee, UUID> {

    @Query("SELECT s FROM ShippingFee s WHERE s.order.id = :orderId")
    Optional<ShippingFee> findByOrderId(UUID orderId);
}