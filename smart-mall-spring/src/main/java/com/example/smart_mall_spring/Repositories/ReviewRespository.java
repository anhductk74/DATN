package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Products.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReviewRespository extends JpaRepository<Review, UUID> {
}
