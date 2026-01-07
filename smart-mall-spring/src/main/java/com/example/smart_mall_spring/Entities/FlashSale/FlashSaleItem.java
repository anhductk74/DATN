package com.example.smart_mall_spring.Entities.FlashSale;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "flash_sale_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"flashSale", "product", "productVariant"})
public class FlashSaleItem extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flash_sale_id", nullable = false)
    @JsonIgnore
    private FlashSale flashSale;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;
    
    @Column(nullable = false)
    private Double originalPrice;
    
    @Column(nullable = false)
    private Double flashSalePrice;
    
    @Column(nullable = false)
    private Integer discountPercent;
    
    @Column(nullable = false)
    private Integer totalQuantity;
    
    @Column(nullable = false)
    private Integer remainingQuantity;
    
    @Column(nullable = false)
    private Integer soldQuantity = 0;
    
    @Column(name = "max_quantity_per_user")
    private Integer maxQuantityPerUser = 5;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    public Double getDiscountAmount() {
        return originalPrice - flashSalePrice;
    }
    
    public boolean hasStock() {
        return remainingQuantity > 0;
    }
    
    public boolean canPurchase(Integer quantity) {
        return isActive && hasStock() && quantity <= remainingQuantity;
    }
    
    @PrePersist
    @PreUpdate
    private void calculateDiscount() {
        if (originalPrice != null && flashSalePrice != null && originalPrice > 0) {
            this.discountPercent = (int) Math.round(((originalPrice - flashSalePrice) / originalPrice) * 100);
        }
    }
}
