package com.example.smart_mall_spring.Services.Shop;

import com.example.smart_mall_spring.Dtos.Address.CreateAddressDto;
import com.example.smart_mall_spring.Dtos.Shop.CreateShopDto;
import com.example.smart_mall_spring.Dtos.Shop.ShopResponseDto;
import com.example.smart_mall_spring.Dtos.Shop.UpdateShopDto;
import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Repositories.AddressRespository;
import com.example.smart_mall_spring.Repositories.ShopRespository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ShopService {
    @Autowired
    private final ShopRespository shopRes;
    @Autowired
    private final AddressRespository addressRes;
    @Autowired
    private final CloudinaryService cloudinaryService;
    @Autowired
    private final ObjectMapper objectMapper;

    public ShopService(ShopRespository shopRes, AddressRespository addressRes, 
                       CloudinaryService cloudinaryService, ObjectMapper objectMapper) {
        this.shopRes = shopRes;
        this.addressRes = addressRes;
        this.cloudinaryService = cloudinaryService;
        this.objectMapper = objectMapper;
    }


    public ShopResponseDto createShop(CreateShopDto createShopDto) {
        Shop shop = new Shop();
        if(createShopDto.getName() != null)
            shop.setName(createShopDto.getName());
        if(createShopDto.getDescription() != null)
            shop.setDescription(createShopDto.getDescription());
        if(createShopDto.getPhoneNumber() != null)
            shop.setPhoneNumber(createShopDto.getPhoneNumber());
        if(createShopDto.getAvatar() != null)
            shop.setAvatar(createShopDto.getAvatar());
        
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
                .description(shop.getDescription())
                .numberPhone(shop.getPhoneNumber())
                .avatar(shop.getAvatar())
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
        if (updateShopDto.getDescription() != null) {
            shop.setDescription(updateShopDto.getDescription());
        }
        if (updateShopDto.getPhoneNumber() != null) {
            shop.setPhoneNumber(updateShopDto.getPhoneNumber());
        }
        if (updateShopDto.getAvatar() != null) {
            shop.setAvatar(updateShopDto.getAvatar());
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
}
