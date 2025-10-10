package com.example.smart_mall_spring.Services;

import com.example.smart_mall_spring.Dtos.UserAddress.UserAddressRequestDto;
import com.example.smart_mall_spring.Dtos.UserAddress.UserAddressResponseDto;
import com.example.smart_mall_spring.Dtos.UserAddress.UpdateUserAddressDto;
import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserAddress;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Exception.ResourceNotFoundException;
import com.example.smart_mall_spring.Repositories.UserAddressRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    /**
     * Get all ACTIVE addresses for a user
     */
    public List<UserAddressResponseDto> getUserAddresses(UUID userId) {
        List<UserAddress> addresses = userAddressRepository.findByUserIdAndStatusOrderByIsDefaultDescCreatedAtDesc(userId, Status.ACTIVE);
        return addresses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get default ACTIVE address for a user
     */
    public UserAddressResponseDto getDefaultAddress(UUID userId) {
        UserAddress defaultAddress = userAddressRepository.findByUserIdAndIsDefaultTrueAndStatus(userId, Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Default address not found for user"));
        return convertToResponseDto(defaultAddress);
    }

    /**
     * Get specific ACTIVE address by ID
     */
    public UserAddressResponseDto getAddressById(UUID addressId, UUID userId) {
        UserAddress address = userAddressRepository.findByIdAndUserIdAndStatus(addressId, userId, Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or access denied"));
        return convertToResponseDto(address);
    }

    /**
     * Create new address for user
     */
    @Transactional
    public UserAddressResponseDto createAddress(UUID userId, UserAddressRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If this is set as default, unset all other ACTIVE defaults
        if (requestDto.getIsDefault()) {
            userAddressRepository.setAllActiveAddressesAsNonDefault(userId, Status.ACTIVE);
        }

        // Create Address entity
        Address address = new Address();
        address.setStreet(requestDto.getStreet());
        address.setCommune(requestDto.getCommune());
        address.setDistrict(requestDto.getDistrict());
        address.setCity(requestDto.getCity());

        // Create UserAddress entity
        UserAddress userAddress = new UserAddress();
        userAddress.setUser(user);
        userAddress.setRecipient(requestDto.getRecipient());
        userAddress.setPhoneNumber(requestDto.getPhoneNumber());
        userAddress.setAddressType(requestDto.getAddressType());
        userAddress.setAddress(address);
        userAddress.setDefault(requestDto.getIsDefault());
        userAddress.setStatus(Status.ACTIVE); // Set as ACTIVE

        UserAddress savedAddress = userAddressRepository.save(userAddress);
        return convertToResponseDto(savedAddress);
    }

    /**
     * Update existing ACTIVE address
     */
    @Transactional
    public UserAddressResponseDto updateAddress(UUID addressId, UUID userId, UpdateUserAddressDto updateDto) {
        UserAddress existingAddress = userAddressRepository.findByIdAndUserIdAndStatus(addressId, userId, Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or access denied"));

        // Update fields if provided
        if (updateDto.getRecipient() != null) {
            existingAddress.setRecipient(updateDto.getRecipient());
        }
        if (updateDto.getPhoneNumber() != null) {
            existingAddress.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getAddressType() != null) {
            existingAddress.setAddressType(updateDto.getAddressType());
        }

        // Update address details
        Address address = existingAddress.getAddress();
        if (updateDto.getStreet() != null) {
            address.setStreet(updateDto.getStreet());
        }
        if (updateDto.getCommune() != null) {
            address.setCommune(updateDto.getCommune());
        }
        if (updateDto.getDistrict() != null) {
            address.setDistrict(updateDto.getDistrict());
        }
        if (updateDto.getCity() != null) {
            address.setCity(updateDto.getCity());
        }

        // Handle default status change
        if (updateDto.getIsDefault() != null) {
            if (updateDto.getIsDefault()) {
                // Set as default, unset others
                userAddressRepository.setAllActiveAddressesAsNonDefault(userId, Status.ACTIVE);
                existingAddress.setDefault(true);
            } else {
                existingAddress.setDefault(false);
            }
        }

        UserAddress updatedAddress = userAddressRepository.save(existingAddress);
        return convertToResponseDto(updatedAddress);
    }

    /**
     * Set ACTIVE address as default
     */
    @Transactional
    public UserAddressResponseDto setAsDefault(UUID addressId, UUID userId) {
        UserAddress address = userAddressRepository.findByIdAndUserIdAndStatus(addressId, userId, Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or access denied"));

        // Unset all other ACTIVE defaults
        userAddressRepository.setAllActiveAddressesAsNonDefault(userId, Status.ACTIVE);
        
        // Set this as default
        address.setDefault(true);
        UserAddress updatedAddress = userAddressRepository.save(address);
        
        return convertToResponseDto(updatedAddress);
    }

    /**
     * Soft delete address (set status to INACTIVE)
     */
    @Transactional
    public void deleteAddress(UUID addressId, UUID userId) {
        // Verify address exists and is ACTIVE
        userAddressRepository.findByIdAndUserIdAndStatus(addressId, userId, Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or access denied"));

        // Use soft delete
        userAddressRepository.softDeleteAddress(addressId, userId, Status.INACTIVE);
    }

    /**
     * Get ACTIVE address statistics for user
     */
    public long getAddressCount(UUID userId) {
        return userAddressRepository.countByUserIdAndStatus(userId, Status.ACTIVE);
    }

    /**
     * Get ACTIVE addresses by type for a user
     */
    public List<UserAddressResponseDto> getUserAddressesByType(UUID userId, com.example.smart_mall_spring.Enum.AddressType addressType) {
        List<UserAddress> addresses = userAddressRepository.findByUserIdAndAddressTypeAndStatusOrderByIsDefaultDescCreatedAtDesc(userId, addressType, Status.ACTIVE);
        return addresses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert UserAddress entity to response DTO
     */
    private UserAddressResponseDto convertToResponseDto(UserAddress userAddress) {
        UserAddressResponseDto responseDto = new UserAddressResponseDto();
        responseDto.setId(userAddress.getId());
        responseDto.setRecipient(userAddress.getRecipient());
        responseDto.setPhoneNumber(userAddress.getPhoneNumber());
        responseDto.setAddressType(userAddress.getAddressType());
        
        // Address details
        Address address = userAddress.getAddress();
        responseDto.setStreet(address.getStreet());
        responseDto.setCommune(address.getCommune());
        responseDto.setDistrict(address.getDistrict());
        responseDto.setCity(address.getCity());
        
        // Full address for display
        responseDto.setFullAddress(String.format("%s, %s, %s, %s", 
                address.getStreet(), address.getCommune(), address.getDistrict(), address.getCity()));
        
        responseDto.setDefault(userAddress.isDefault());
        responseDto.setStatus(userAddress.getStatus());
        responseDto.setCreatedAt(userAddress.getCreatedAt());
        responseDto.setUpdatedAt(userAddress.getUpdatedAt());
        
        return responseDto;
    }
}