package com.example.smart_mall_spring.Entities.Carts;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CartItem extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    private Integer quantity;
}
