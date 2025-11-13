package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Users.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    // Get users by role name with pagination
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH u.profile WHERE r.name = :roleName")
    Page<User> findByRoleName(String roleName, Pageable pageable);
}