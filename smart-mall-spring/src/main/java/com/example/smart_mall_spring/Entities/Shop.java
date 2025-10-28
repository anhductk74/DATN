package com.example.smart_mall_spring.Entities;

import com.example.smart_mall_spring.Entities.Users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Shop extends BaseEntity {
    @Column(nullable = false)
    private String name;
    
    @Column(length = 12)
    private String cccd;
    
    private String description;
    private String phoneNumber;
    private String avatar;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner; // Shop owner
}
