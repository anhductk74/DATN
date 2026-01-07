package com.example.smart_mall_spring.Services.FlashSale;

import com.example.smart_mall_spring.Dtos.FlashSale.*;
import com.example.smart_mall_spring.Entities.FlashSale.FlashSale;
import com.example.smart_mall_spring.Entities.FlashSale.FlashSaleItem;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Exception.ResourceNotFoundException;
import com.example.smart_mall_spring.Repositories.FlashSaleItemRepository;
import com.example.smart_mall_spring.Repositories.FlashSaleRepository;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import com.example.smart_mall_spring.Repositories.ProductVariantRepository;
import com.example.smart_mall_spring.Services.Shop.ShopService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {
    
    private final FlashSaleRepository flashSaleRepository;
    private final FlashSaleItemRepository flashSaleItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ShopService shopService;
    
    @Transactional
    public FlashSaleResponseDto createFlashSale(CreateFlashSaleDto dto) {
        // Validate shop exists
        Shop shop = shopService.getShopEntityById(dto.getShopId());
        
        // Create flash sale entity
        FlashSale flashSale = new FlashSale();
        flashSale.setName(dto.getName());
        flashSale.setDescription(dto.getDescription());
        flashSale.setStartTime(dto.getStartTime());
        flashSale.setEndTime(dto.getEndTime());
        flashSale.setBannerImage(dto.getBannerImage());
        flashSale.setShop(shop);
        flashSale.setDisplayPriority(dto.getDisplayPriority());
        flashSale.setStatus(Status.PENDING);
        flashSale.setIsDeleted(false);
        
        // Save flash sale first to get ID
        flashSale = flashSaleRepository.save(flashSale);
        
        // Create flash sale items
        List<FlashSaleItem> items = new ArrayList<>();
        for (CreateFlashSaleItemDto itemDto : dto.getItems()) {
            FlashSaleItem item = createFlashSaleItem(flashSale, itemDto);
            items.add(item);
        }
        flashSale.setFlashSaleItems(items);
        
        return convertToResponseDto(flashSale);
    }
    
    private FlashSaleItem createFlashSaleItem(FlashSale flashSale, CreateFlashSaleItemDto dto) {
        // Validate product exists
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + dto.getProductId()));
        
        ProductVariant variant = null;
        if (dto.getProductVariantId() != null) {
            variant = productVariantRepository.findById(dto.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with ID: " + dto.getProductVariantId()));
        }
        
        FlashSaleItem item = new FlashSaleItem();
        item.setFlashSale(flashSale);
        item.setProduct(product);
        item.setProductVariant(variant);
        item.setOriginalPrice(dto.getOriginalPrice());
        item.setFlashSalePrice(dto.getFlashSalePrice());
        item.setTotalQuantity(dto.getTotalQuantity());
        item.setRemainingQuantity(dto.getTotalQuantity());
        item.setSoldQuantity(0);
        item.setMaxQuantityPerUser(dto.getMaxQuantityPerUser());
        item.setIsActive(true);
        
        return flashSaleItemRepository.save(item);
    }
    
    @Transactional
    public FlashSaleResponseDto updateFlashSale(UUID id, UpdateFlashSaleDto dto) {
        FlashSale flashSale = flashSaleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flash sale not found with ID: " + id));
        
        // Check if flash sale has started
        if (flashSale.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot update flash sale that has already started");
        }
        
        // Update basic fields
        if (dto.getName() != null) {
            flashSale.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            flashSale.setDescription(dto.getDescription());
        }
        if (dto.getStartTime() != null) {
            flashSale.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            flashSale.setEndTime(dto.getEndTime());
        }
        if (dto.getBannerImage() != null) {
            flashSale.setBannerImage(dto.getBannerImage());
        }
        if (dto.getDisplayPriority() != null) {
            flashSale.setDisplayPriority(dto.getDisplayPriority());
        }
        
        // Update items if provided
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            updateFlashSaleItems(flashSale, dto.getItems());
        }
        
        flashSale = flashSaleRepository.save(flashSale);
        return convertToResponseDto(flashSale);
    }
    
    private void updateFlashSaleItems(FlashSale flashSale, List<UpdateFlashSaleItemDto> itemDtos) {
        for (UpdateFlashSaleItemDto itemDto : itemDtos) {
            if (itemDto.getId() != null) {
                FlashSaleItem item = flashSaleItemRepository.findById(itemDto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Flash sale item not found with ID: " + itemDto.getId()));
                
                if (itemDto.getOriginalPrice() != null) {
                    item.setOriginalPrice(itemDto.getOriginalPrice());
                }
                if (itemDto.getFlashSalePrice() != null) {
                    item.setFlashSalePrice(itemDto.getFlashSalePrice());
                }
                if (itemDto.getTotalQuantity() != null) {
                    int difference = itemDto.getTotalQuantity() - item.getTotalQuantity();
                    item.setTotalQuantity(itemDto.getTotalQuantity());
                    item.setRemainingQuantity(item.getRemainingQuantity() + difference);
                }
                if (itemDto.getMaxQuantityPerUser() != null) {
                    item.setMaxQuantityPerUser(itemDto.getMaxQuantityPerUser());
                }
                if (itemDto.getIsActive() != null) {
                    item.setIsActive(itemDto.getIsActive());
                }
                
                flashSaleItemRepository.save(item);
            }
        }
    }
    
    @Transactional
    public void deleteFlashSale(UUID id) {
        FlashSale flashSale = flashSaleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flash sale not found with ID: " + id));
        
        flashSale.setIsDeleted(true);
        flashSaleRepository.save(flashSale);
    }
    
    public FlashSaleResponseDto getFlashSaleById(UUID id) {
        FlashSale flashSale = flashSaleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flash sale not found with ID: " + id));
        
        return convertToResponseDto(flashSale);
    }
    
    public Page<FlashSaleResponseDto> getAllFlashSales(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<FlashSale> flashSales = flashSaleRepository.findByIsDeletedFalse(pageable);
        return flashSales.map(this::convertToResponseDto);
    }
    
    public Page<FlashSaleResponseDto> getActiveFlashSales(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FlashSale> flashSales = flashSaleRepository.findActiveFlashSales(LocalDateTime.now(), pageable);
        return flashSales.map(this::convertToResponseDto);
    }
    
    public Page<FlashSaleResponseDto> getUpcomingFlashSales(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FlashSale> flashSales = flashSaleRepository.findUpcomingFlashSales(LocalDateTime.now(), pageable);
        return flashSales.map(this::convertToResponseDto);
    }
    
    public Page<FlashSaleResponseDto> getFlashSalesByShop(UUID shopId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        Page<FlashSale> flashSales = flashSaleRepository.findByShopIdAndIsDeletedFalse(shopId, pageable);
        return flashSales.map(this::convertToResponseDto);
    }
    
    public Page<FlashSaleResponseDto> getFlashSalesByStatus(Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FlashSale> flashSales = flashSaleRepository.findByStatusAndIsDeletedFalse(status, pageable);
        return flashSales.map(this::convertToResponseDto);
    }
    
    public Page<FlashSaleResponseDto> searchFlashSales(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FlashSale> flashSales = flashSaleRepository.searchByName(keyword, pageable);
        return flashSales.map(this::convertToResponseDto);
    }
    
    @Transactional
    public FlashSaleResponseDto approveFlashSale(UUID id) {
        FlashSale flashSale = flashSaleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flash sale not found with ID: " + id));
        
        flashSale.setStatus(Status.APPROVED);
        flashSale = flashSaleRepository.save(flashSale);
        
        return convertToResponseDto(flashSale);
    }
    
    @Transactional
    public FlashSaleResponseDto rejectFlashSale(UUID id) {
        FlashSale flashSale = flashSaleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flash sale not found with ID: " + id));
        
        flashSale.setStatus(Status.REJECTED);
        flashSale = flashSaleRepository.save(flashSale);
        
        return convertToResponseDto(flashSale);
    }
    
    public List<FlashSaleItemResponseDto> getFlashSaleItems(UUID flashSaleId) {
        List<FlashSaleItem> items = flashSaleItemRepository.findByFlashSaleId(flashSaleId);
        return items.stream()
                .map(this::convertToItemResponseDto)
                .collect(Collectors.toList());
    }
    
    private FlashSaleResponseDto convertToResponseDto(FlashSale flashSale) {
        LocalDateTime now = LocalDateTime.now();
        
        List<FlashSaleItemResponseDto> items = flashSale.getFlashSaleItems() != null ?
                flashSale.getFlashSaleItems().stream()
                        .map(this::convertToItemResponseDto)
                        .collect(Collectors.toList()) : new ArrayList<>();
        
        Long timeUntilStart = null;
        Long timeUntilEnd = null;
        
        if (flashSale.getStartTime().isAfter(now)) {
            timeUntilStart = Duration.between(now, flashSale.getStartTime()).getSeconds();
        }
        
        if (flashSale.getEndTime().isAfter(now)) {
            timeUntilEnd = Duration.between(now, flashSale.getEndTime()).getSeconds();
        }
        
        return FlashSaleResponseDto.builder()
                .id(flashSale.getId())
                .name(flashSale.getName())
                .description(flashSale.getDescription())
                .startTime(flashSale.getStartTime())
                .endTime(flashSale.getEndTime())
                .status(flashSale.getStatus())
                .bannerImage(flashSale.getBannerImage())
                .shopId(flashSale.getShop() != null ? flashSale.getShop().getId() : null)
                .shopName(flashSale.getShop() != null ? flashSale.getShop().getName() : null)
                .displayPriority(flashSale.getDisplayPriority())
                .isDeleted(flashSale.getIsDeleted())
                .createdAt(flashSale.getCreatedAt())
                .updatedAt(flashSale.getUpdatedAt())
                .items(items)
                .isActive(flashSale.isActive())
                .isUpcoming(flashSale.isUpcoming())
                .isExpired(flashSale.isExpired())
                .timeUntilStart(timeUntilStart)
                .timeUntilEnd(timeUntilEnd)
                .totalItems(items.size())
                .activeItems((int) items.stream().filter(FlashSaleItemResponseDto::getIsActive).count())
                .build();
    }
    
    private FlashSaleItemResponseDto convertToItemResponseDto(FlashSaleItem item) {
        Product product = item.getProduct();
        ProductVariant variant = item.getProductVariant();
        
        int stockPercent = item.getTotalQuantity() > 0 ?
                (int) ((item.getRemainingQuantity() * 100.0) / item.getTotalQuantity()) : 0;
        
        return FlashSaleItemResponseDto.builder()
                .id(item.getId())
                .flashSaleId(item.getFlashSale().getId())
                .productId(product.getId())
                .productName(product.getName())
                .productBrand(product.getBrand())
                .productImages(product.getImages())
                .productVariantId(variant != null ? variant.getId() : null)
                .variantSku(variant != null ? variant.getSku() : null)
                .originalPrice(item.getOriginalPrice())
                .flashSalePrice(item.getFlashSalePrice())
                .discountAmount(item.getDiscountAmount())
                .discountPercent(item.getDiscountPercent())
                .totalQuantity(item.getTotalQuantity())
                .remainingQuantity(item.getRemainingQuantity())
                .soldQuantity(item.getSoldQuantity())
                .maxQuantityPerUser(item.getMaxQuantityPerUser())
                .isActive(item.getIsActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .savingsPercent((double) item.getDiscountPercent())
                .hasStock(item.hasStock())
                .stockPercent(stockPercent)
                .build();
    }
}
