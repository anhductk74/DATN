package com.example.smart_mall_spring.Entities.Products;

import com.example.smart_mall_spring.Dtos.Products.ProductVariantDto;
import com.example.smart_mall_spring.Dtos.Products.VariantAttributeDto;
import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Carts.CartItem;
import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProductVariant extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private String sku;

    private Double price;
    private Integer stock;
    private Double weight;
    private String dimensions;


    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<VariantAttribute> attributes;

    @OneToMany(mappedBy = "variant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "variant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
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
