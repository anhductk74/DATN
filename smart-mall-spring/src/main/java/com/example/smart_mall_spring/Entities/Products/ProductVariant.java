package com.example.smart_mall_spring.Entities.Products;

import com.example.smart_mall_spring.Dtos.Products.ProductVariantDto;
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

    @Column(unique = true)
    private String sku;

    private Double price;
    private Integer stock;
    private Double weight;
    private String dimensions;


    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariantAttribute> attributes;

    @OneToMany(mappedBy = "variant")
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "variant")
    private List<CartItem> cartItems;

    public ProductVariantDto toDto() {
        return ProductVariantDto.builder()
                .id(this.getId())
                .sku(this.getSku())
                .price(this.getPrice())
                .stock(this.getStock())
                .weight(this.getWeight())
                .dimensions(this.getDimensions())
                .build();
    }
}
