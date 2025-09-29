package com.example.smart_mall_spring.Entities.Categories;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Products.Product;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Category extends BaseEntity {
    private String name;
    private String description;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> subCategories;

    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
