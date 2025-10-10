package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Users.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, UUID> {

    /**
     * Find all ACTIVE addresses for a specific user
     */
    List<UserAddress> findByUserIdAndStatusOrderByIsDefaultDescCreatedAtDesc(UUID userId, com.example.smart_mall_spring.Enum.Status status);

    /**
     * Find default ACTIVE address for a user
     */
    Optional<UserAddress> findByUserIdAndIsDefaultTrueAndStatus(UUID userId, com.example.smart_mall_spring.Enum.Status status);

    /**
     * Find ACTIVE address by ID and user ID (for security)
     */
    Optional<UserAddress> findByIdAndUserIdAndStatus(UUID addressId, UUID userId, com.example.smart_mall_spring.Enum.Status status);

    /**
     * Check if user has any ACTIVE addresses
     */
    boolean existsByUserIdAndStatus(UUID userId, com.example.smart_mall_spring.Enum.Status status);

    /**
     * Count ACTIVE addresses for a user
     */
    long countByUserIdAndStatus(UUID userId, com.example.smart_mall_spring.Enum.Status status);

    /**
     * Set all ACTIVE addresses as non-default for a user
     */
    @Modifying
    @Query("UPDATE UserAddress ua SET ua.isDefault = false WHERE ua.user.id = :userId AND ua.status = :status")
    void setAllActiveAddressesAsNonDefault(@Param("userId") UUID userId, @Param("status") com.example.smart_mall_spring.Enum.Status status);

    /**
     * Soft delete address (set status to INACTIVE)
     */
    @Modifying
    @Query("UPDATE UserAddress ua SET ua.status = :status WHERE ua.id = :addressId AND ua.user.id = :userId")
    void softDeleteAddress(@Param("addressId") UUID addressId, @Param("userId") UUID userId, @Param("status") com.example.smart_mall_spring.Enum.Status status);

    /**
     * Find ACTIVE addresses by user ID and address type
     */
    List<UserAddress> findByUserIdAndAddressTypeAndStatusOrderByIsDefaultDescCreatedAtDesc(UUID userId, com.example.smart_mall_spring.Enum.AddressType addressType, com.example.smart_mall_spring.Enum.Status status);
}