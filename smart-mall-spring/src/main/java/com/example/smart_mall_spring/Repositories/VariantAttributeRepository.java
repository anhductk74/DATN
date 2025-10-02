package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.VariantAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VariantAttributeRepository extends JpaRepository<VariantAttribute, UUID> {
    
    List<VariantAttribute> findByVariantId(UUID variantId);
    
    void deleteByVariantId(UUID variantId);
}