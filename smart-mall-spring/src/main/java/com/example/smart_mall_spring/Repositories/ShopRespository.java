package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShopRespository extends JpaRepository<Shop, UUID> {
}
