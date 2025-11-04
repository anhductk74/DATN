package com.example.smart_mall_spring.Services.Shop;

import com.example.smart_mall_spring.Dtos.Address.CreateAddressDto;
import com.example.smart_mall_spring.Dtos.Shop.CreateShopDto;
import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Dtos.Shop.UpdateShopDto;
import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Repositories.AddressRespository;
import com.example.smart_mall_spring.Repositories.ShopRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ShopService {
    @Autowired
    private final ShopRepository shopRes;
    @Autowired
    private final AddressRespository addressRes;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final CloudinaryService cloudinaryService;
    @Autowired
    private final ObjectMapper objectMapper;

    public ShopService(ShopRepository shopRes, AddressRespository addressRes,
                       UserRepository userRepository, CloudinaryService cloudinaryService,
                       ObjectMapper objectMapper) {
        this.shopRes = shopRes;
        this.addressRes = addressRes;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.objectMapper = objectMapper;
    }


    public ShopResponseDto createShop(CreateShopDto createShopDto) {
        Shop shop = new Shop();
        if(createShopDto.getName() != null)
            shop.setName(createShopDto.getName());
        if(createShopDto.getCccd() != null)
            shop.setCccd(createShopDto.getCccd());
        if(createShopDto.getDescription() != null)
            shop.setDescription(createShopDto.getDescription());
        if(createShopDto.getPhoneNumber() != null)
            shop.setPhoneNumber(createShopDto.getPhoneNumber());
        if(createShopDto.getAvatar() != null)
            shop.setAvatar(createShopDto.getAvatar());
        
        // Set owner if provided
        if(createShopDto.getOwnerId() != null) {
            User owner = userRepository.findById(createShopDto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found with id: " + createShopDto.getOwnerId()));
            shop.setOwner(owner);
        }
        
        // Handle address if provided
        if(createShopDto.getAddress() != null) {
            Address address = convertCreateAddressDtoToEntity(createShopDto.getAddress());
            address = addressRes.save(address);
            shop.setAddress(address);
        }
        
        shop = shopRes.save(shop);
        return convertDto(shop);
    }

    public ShopResponseDto createShop(String shopDataJson, MultipartFile imageFile) {
        try {
            // Parse JSON string to CreateShopDto
            CreateShopDto createShopDto = objectMapper.readValue(shopDataJson, CreateShopDto.class);
            
            // Upload image (required)
            Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile);
            createShopDto.setAvatar(uploadResult.get("url"));
            
            return createShop(createShopDto);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create shop: " + e.getMessage(), e);
        }
    }

    private ShopResponseDto convertDto(Shop shop) {
        return ShopResponseDto.builder()
                .id(shop.getId())
                .name(shop.getName())
                .cccd(shop.getCccd())
                .description(shop.getDescription())
                .numberPhone(shop.getPhoneNumber())
                .avatar(shop.getAvatar())
                .viewCount(shop.getViewCount() != null ? shop.getViewCount() : 0L)
                .ownerId(shop.getOwner() != null ? shop.getOwner().getId() : null)
                .ownerName(shop.getOwner() != null ? shop.getOwner().getProfile().getFullName() : null)
                .address(shop.getAddress() != null ? convertAddressToDto(shop.getAddress()) : null)
                .build();
    }

    private CreateAddressDto convertAddressToDto(Address address) {
        if (address == null) return null;
        
        return CreateAddressDto.builder()
                .street(address.getStreet())
                .commune(address.getCommune())
                .district(address.getDistrict())
                .city(address.getCity())
                .build();
    }
    
    private Address convertCreateAddressDtoToEntity(CreateAddressDto addressDto) {
        if (addressDto == null) return null;
        
        Address address = new Address();
        address.setStreet(addressDto.getStreet());
        address.setCommune(addressDto.getCommune());
        address.setDistrict(addressDto.getDistrict());
        address.setCity(addressDto.getCity());
        return address;
    }
    // Get all shops

    public List<ShopResponseDto> getAllShops() {
        List<Shop> shops = shopRes.findAll();
        return shops.stream()
                .map(this::convertDto)
                .toList();
    }

    // Get shop by ID
    public ShopResponseDto getShopById(UUID id) {
        Optional<Shop> shopOptional = shopRes.findById(id);
        if (shopOptional.isEmpty()) {
            throw new RuntimeException("Shop not found with id: " + id);
        }
        return convertDto(shopOptional.get());
    }

    // Update shop
    public ShopResponseDto updateShop(UUID id, UpdateShopDto updateShopDto) {
        Optional<Shop> shopOptional = shopRes.findById(id);
        if (shopOptional.isEmpty()) {
            throw new RuntimeException("Shop not found with id: " + id);
        }

        Shop shop = shopOptional.get();
        
        // Update fields if provided
        if (updateShopDto.getName() != null) {
            shop.setName(updateShopDto.getName());
        }
        if (updateShopDto.getCccd() != null) {
            shop.setCccd(updateShopDto.getCccd());
        }
        if (updateShopDto.getDescription() != null) {
            shop.setDescription(updateShopDto.getDescription());
        }
        if (updateShopDto.getPhoneNumber() != null) {
            shop.setPhoneNumber(updateShopDto.getPhoneNumber());
        }
        if (updateShopDto.getAvatar() != null) {
            shop.setAvatar(updateShopDto.getAvatar());
        }

        // Update owner if provided (chuyển quyền sở hữu)
        if (updateShopDto.getOwnerId() != null) {
            User newOwner = userRepository.findById(updateShopDto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found with id: " + updateShopDto.getOwnerId()));
            shop.setOwner(newOwner);
        }

        // Update address if provided
        if (updateShopDto.getAddress() != null) {
            if (shop.getAddress() != null) {
                // Update existing address
                Address existingAddress = shop.getAddress();
                if (updateShopDto.getAddress().getStreet() != null) {
                    existingAddress.setStreet(updateShopDto.getAddress().getStreet());
                }
                if (updateShopDto.getAddress().getCommune() != null) {
                    existingAddress.setCommune(updateShopDto.getAddress().getCommune());
                }
                if (updateShopDto.getAddress().getDistrict() != null) {
                    existingAddress.setDistrict(updateShopDto.getAddress().getDistrict());
                }
                if (updateShopDto.getAddress().getCity() != null) {
                    existingAddress.setCity(updateShopDto.getAddress().getCity());
                }
                addressRes.save(existingAddress);
            } else {
                // Create new address
                Address newAddress = convertCreateAddressDtoToEntity(updateShopDto.getAddress());
                newAddress = addressRes.save(newAddress);
                shop.setAddress(newAddress);
            }
        }

        shop = shopRes.save(shop);
        return convertDto(shop);
    }

    public ShopResponseDto updateShopWithImage(UUID id, String shopDataJson, MultipartFile imageFile) {
        try {
            // Parse JSON string to UpdateShopDto
            UpdateShopDto updateShopDto = objectMapper.readValue(shopDataJson, UpdateShopDto.class);
            
            // Upload new image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile);
                updateShopDto.setAvatar(uploadResult.get("url"));
            }
            
            return updateShop(id, updateShopDto);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to update shop: " + e.getMessage(), e);
        }
    }

    // Delete shop
    public void deleteShop(UUID id) {
        Optional<Shop> shopOptional = shopRes.findById(id);
        if (shopOptional.isEmpty()) {
            throw new RuntimeException("Shop not found with id: " + id);
        }

        Shop shop = shopOptional.get();
        
        // Delete associated address if exists
        if (shop.getAddress() != null) {
            addressRes.delete(shop.getAddress());
        }
        
        // Delete shop
        shopRes.delete(shop);
    }

    // Get shops by owner ID (UUID user)
    public List<ShopResponseDto> getShopsByOwnerId(UUID ownerId) {
        List<Shop> shops = shopRes.findByOwnerId(ownerId);
        return shops.stream()
                .map(this::convertDto)
                .toList();
    }

    // Search shops by name
    public List<ShopResponseDto> searchShopsByName(String name) {
        List<Shop> shops = shopRes.findByNameContaining(name);
        return shops.stream()
                .map(this::convertDto)
                .toList();
    }

    // Search shops by owner and name
    public List<ShopResponseDto> searchShopsByOwnerAndName(UUID ownerId, String name) {
        List<Shop> shops = shopRes.findByOwnerIdAndNameContaining(ownerId, name);
        return shops.stream()
                .map(this::convertDto)
                .toList();
    }

    // Get shop count by owner
    public long getShopCountByOwner(UUID ownerId) {
        return shopRes.countByOwnerId(ownerId);
    }
    
    // Get current authenticated user ID (returns null if not authenticated)
    private UUID getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                return userDetails.getUser().getId();
            }
        } catch (Exception e) {
            // User is not authenticated or error occurred
            System.err.println("Error getting current user: " + e.getMessage());
        }
        return null;
    }
    
    // Increment shop view count (only if current user is not the shop owner)
    @Transactional
    public void incrementViewCount(UUID shopId) {
        // Verify shop exists
        Shop shop = shopRes.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));
        
        // Get current user ID
        UUID currentUserId = getCurrentUserId();
        
        // Only increment if current user is not the shop owner
        if (currentUserId == null || !currentUserId.equals(shop.getOwner() != null ? shop.getOwner().getId() : null)) {
            shopRes.incrementViewCount(shopId);
        } else {
            System.out.println("Shop owner viewing their own shop - view count not incremented");
        }
    }
    
    // Get shop view count
    public Long getShopViewCount(UUID shopId) {
        Shop shop = shopRes.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));
        return shop.getViewCount();
    }
}
