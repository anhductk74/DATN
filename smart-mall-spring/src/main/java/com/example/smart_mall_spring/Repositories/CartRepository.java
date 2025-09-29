package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Carts.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
}
