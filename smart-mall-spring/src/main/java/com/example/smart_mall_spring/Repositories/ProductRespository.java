package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Carts.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductRespository extends JpaRepository<CartItem, UUID> {
}
