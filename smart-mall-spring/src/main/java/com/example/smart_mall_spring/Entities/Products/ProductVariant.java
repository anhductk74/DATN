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

        String productName = (product != null && product.getName() != null)
                ? product.getName() : "Unnamed Product";

        String productBrand = (product != null && product.getBrand() != null)
                ? product.getBrand() : "Unknown Brand";

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
                .productName(productName)
                .productBrand(productBrand)
                .createdAt(this.getCreatedAt())
                .updatedAt(this.getUpdatedAt())
                .build();
    }
}
