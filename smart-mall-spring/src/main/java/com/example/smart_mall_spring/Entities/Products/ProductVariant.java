package com.example.smart_mall_spring.Entities.Products;

import com.example.smart_mall_spring.Dtos.Products.ProductVariantDto;
import com.example.smart_mall_spring.Dtos.Products.VariantAttributeDto;
import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Carts.CartItem;
import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"product", "attributes", "orderItems", "cartItems"})
public class ProductVariant extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    private String sku;

    private Double price;
    private Integer stock;
    private Double weight;
    private String dimensions;
    
    // Flash Sale fields
    @Column(name = "is_flash_sale")
    private Boolean isFlashSale = false;
    
    @Column(name = "flash_sale_price")
    private Double flashSalePrice;
    
    @Column(name = "flash_sale_start")
    private java.time.LocalDateTime flashSaleStart;
    
    @Column(name = "flash_sale_end")
    private java.time.LocalDateTime flashSaleEnd;
    
    @Column(name = "flash_sale_quantity")
    private Integer flashSaleQuantity;
    
    public Double getEffectivePrice() {
        if (isFlashSale != null && isFlashSale && isFlashSaleActive()) {
            return flashSalePrice != null ? flashSalePrice : price;
        }
        return price;
    }
    
    public boolean isFlashSaleActive() {
        if (!Boolean.TRUE.equals(isFlashSale) || flashSaleStart == null || flashSaleEnd == null) {
            return false;
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        return now.isAfter(flashSaleStart) && now.isBefore(flashSaleEnd) && 
               (flashSaleQuantity == null || flashSaleQuantity > 0);
    }
    
    public Integer getDiscountPercent() {
        if (price == null || flashSalePrice == null || price == 0) {
            return 0;
        }
        return (int) Math.round(((price - flashSalePrice) / price) * 100);
    }


    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<VariantAttribute> attributes;

    @OneToMany(mappedBy = "variant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "variant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<CartItem> cartItems;

    public ProductVariantDto toDto() {
        // Lấy thông tin product
        Product product = this.getProduct();

        UUID productId = (product != null) ? product.getId() : null;

        String productName = (product != null && product.getName() != null)
                ? product.getName() : "Unnamed Product";

        String productBrand = (product != null && product.getBrand() != null)
                ? product.getBrand() : "Unknown Brand";

        // Lấy ảnh đầu tiên của product nếu có
        String productImage = (product != null && product.getImages() != null && !product.getImages().isEmpty())
                ? product.getImages().get(0) : null;

        // Lấy attribute nếu có
        List<VariantAttributeDto> attributeDtos = null;
        if (this.getAttributes() != null && !this.getAttributes().isEmpty()) {
            attributeDtos = this.getAttributes().stream()
                    .map(attr -> VariantAttributeDto.builder()
                            .id(attr.getId())
                            .name(attr.getAttributeName())
                            .value(attr.getAttributeValue())
                            .build())
                    .toList();
        }

        return ProductVariantDto.builder()
                .id(this.getId())
                .sku(this.getSku())
                .price(this.getPrice())
                .stock(this.getStock())
                .weight(this.getWeight())
                .dimensions(this.getDimensions())
                .attributes(attributeDtos)
                .productId(productId)
                .productName(productName)
                .productBrand(productBrand)
                .productImage(productImage)
                .isFlashSale(this.getIsFlashSale())
                .flashSalePrice(this.getFlashSalePrice())
                .flashSaleStart(this.getFlashSaleStart())
                .flashSaleEnd(this.getFlashSaleEnd())
                .flashSaleQuantity(this.getFlashSaleQuantity())
                .effectivePrice(this.getEffectivePrice())
                .isFlashSaleActive(this.isFlashSaleActive())
                .discountPercent(this.getDiscountPercent())
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .build();
    }
}
