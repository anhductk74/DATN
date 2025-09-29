package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductVariantRespository extends JpaRepository<ProductVariant, UUID> {
}
