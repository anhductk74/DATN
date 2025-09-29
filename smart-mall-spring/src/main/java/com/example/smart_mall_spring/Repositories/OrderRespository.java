package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Orders.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderRespository extends JpaRepository<Order, UUID> {
}
