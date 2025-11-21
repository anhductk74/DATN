package com.example.smart_mall_spring.Entities.Logistics;
import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Products.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class WarehouseInventory extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 50)
    private String unit;

    @Column(length = 100)
    private String location; // Vị trí trong kho (A1-01, B2-05...)
}
