package com.example.taskmanagement_backend.repositories;

import com.example.taskmanagement_backend.dtos.UserDto.UserResponseDto;
import com.example.taskmanagement_backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Long> {

   @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.email = :email")
   Optional<User> findByEmail(@Param("email") String email);

   boolean existsByEmail(String email);

   /**
    * Find first user by role name, ordered by ID ascending
    */
   @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName ORDER BY u.id ASC")
   Optional<User> findFirstByRoles_NameOrderByIdAsc(@Param("roleName") String roleName);

   /**
    * Find first user ordered by ID ascending (fallback for default owner)
    */
   Optional<User> findFirstByOrderByIdAsc();

}