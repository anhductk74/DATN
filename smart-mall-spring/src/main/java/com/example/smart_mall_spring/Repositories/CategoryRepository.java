package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Categories.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
}
