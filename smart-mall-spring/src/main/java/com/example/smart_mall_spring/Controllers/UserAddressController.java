package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Dtos.UserAddress.UserAddressRequestDto;
import com.example.smart_mall_spring.Dtos.UserAddress.UserAddressResponseDto;
import com.example.smart_mall_spring.Dtos.UserAddress.UpdateUserAddressDto;
import com.example.smart_mall_spring.Services.UserAddressService;
import com.example.smart_mall_spring.Utils.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "User Address Management", description = "APIs for managing user delivery addresses")
@SecurityRequirement(name = "Bearer Authentication")
public class UserAddressController {

    private final UserAddressService userAddressService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get all addresses", description = "Retrieve all delivery addresses for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Addresses retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<ApiResponse<List<UserAddressResponseDto>>> getAllAddresses(Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        List<UserAddressResponseDto> addresses = userAddressService.getUserAddresses(userId);
        
        ApiResponse<List<UserAddressResponseDto>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                addresses,
                "Addresses retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/default")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get default address", description = "Retrieve the default delivery address for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Default address retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Default address not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserAddressResponseDto>> getDefaultAddress(Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        UserAddressResponseDto defaultAddress = userAddressService.getDefaultAddress(userId);
        
        ApiResponse<UserAddressResponseDto> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                defaultAddress,
                "Default address retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{addressId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get address by ID", description = "Retrieve a specific address by its ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<ApiResponse<UserAddressResponseDto>> getAddressById(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        UserAddressResponseDto address = userAddressService.getAddressById(addressId, userId);
        
        ApiResponse<UserAddressResponseDto> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                address,
                "Address retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create new address", description = "Create a new delivery address for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Address created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserAddressResponseDto>> createAddress(
            @Valid @RequestBody UserAddressRequestDto requestDto,
            Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        UserAddressResponseDto createdAddress = userAddressService.createAddress(userId, requestDto);
        
        ApiResponse<UserAddressResponseDto> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                createdAddress,
                "Address created successfully"
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Update address", description = "Update an existing delivery address")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<ApiResponse<UserAddressResponseDto>> updateAddress(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            @Valid @RequestBody UpdateUserAddressDto updateDto,
            Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        UserAddressResponseDto updatedAddress = userAddressService.updateAddress(addressId, userId, updateDto);
        
        ApiResponse<UserAddressResponseDto> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                updatedAddress,
                "Address updated successfully"
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{addressId}/set-default")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Set address as default", description = "Set a specific address as the default delivery address")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address set as default successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<ApiResponse<UserAddressResponseDto>> setAsDefault(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        UserAddressResponseDto defaultAddress = userAddressService.setAsDefault(addressId, userId);
        
        ApiResponse<UserAddressResponseDto> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                defaultAddress,
                "Address set as default successfully"
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Delete address", description = "Delete a specific delivery address")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied")
    })
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @Parameter(description = "Address ID") @PathVariable UUID addressId,
            Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        userAddressService.deleteAddress(addressId, userId);
        
        ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                null,
                "Address deleted successfully"
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get address count", description = "Get the total number of addresses for the authenticated user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Address count retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<Long>> getAddressCount(Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        long count = userAddressService.getAddressCount(userId);
        
        ApiResponse<Long> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                count,
                "Address count retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{addressType}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get addresses by type", description = "Retrieve addresses filtered by address type")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Addresses retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid address type")
    })
    public ResponseEntity<ApiResponse<List<UserAddressResponseDto>>> getAddressesByType(
            @Parameter(description = "Address type (HOME, WORK, OTHER)") @PathVariable com.example.smart_mall_spring.Enum.AddressType addressType,
            Authentication authentication) {
        UUID userId = AuthUtils.getUserId(authentication);
        List<UserAddressResponseDto> addresses = userAddressService.getUserAddressesByType(userId, addressType);
        
        ApiResponse<List<UserAddressResponseDto>> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                addresses,
                "Addresses retrieved successfully for type: " + addressType
        );
        return ResponseEntity.ok(response);
    }
}