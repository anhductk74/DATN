    package com.example.smart_mall_spring.Entities.Logistics;


    import com.example.smart_mall_spring.Entities.BaseEntity;
    import com.example.smart_mall_spring.Enum.WarehouseStatus;
    import jakarta.persistence.*;
    import lombok.*;

    import java.util.List;

    @Entity
    @Table(name = "warehouses")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode(callSuper = true)
    public class Warehouse extends BaseEntity {

        @ManyToOne
        @JoinColumn(name = "shipping_company_id", nullable = false)
        private ShippingCompany shippingCompany;

        @Column(length = 100)
        private String name;

        @Column(length = 255)
        private String address;

        @Column(length = 100)
        private String region;

        @Column(length = 100)
        private String province;

        @Column(length = 100)
        private String district;

        @Column(length = 100)
        private String ward;

        @Column(name = "manager_name", length = 100)
        private String managerName;

        @Column(length = 20)
        private String phone;

        @Enumerated(EnumType.STRING)
        private WarehouseStatus status = WarehouseStatus.ACTIVE;

        @Column(name = "capacity")
        private Integer capacity;

        @Column(name = "current_stock")
        private Integer currentStock;

        // Liên kết với hàng hóa
        @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
        private List<WarehouseInventory> items;
    }