package com.example.smart_mall_spring.Entities.Logistics;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Address;

import com.example.smart_mall_spring.Enum.ShippingCompanyStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "shipping_companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"shippers", "warehouses"})
public class ShippingCompany extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, length = 50)
    private String code;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "headquarters_address_id")
    private Address headquartersAddress;

    @Enumerated(EnumType.STRING)
    private ShippingCompanyStatus status = ShippingCompanyStatus.ACTIVE;

    @OneToMany(mappedBy = "shippingCompany", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Shipper> shippers;

    @OneToOne(mappedBy = "shippingCompany", cascade = CascadeType.ALL)
    @JsonIgnore
    private Warehouse warehouse;

}