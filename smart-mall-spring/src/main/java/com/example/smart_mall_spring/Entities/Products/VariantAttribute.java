package com.example.smart_mall_spring.Entities.Products;

import com.example.smart_mall_spring.Entities.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "variant_attributes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class VariantAttribute extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    private String attributeName;
    private String attributeValue;
}
