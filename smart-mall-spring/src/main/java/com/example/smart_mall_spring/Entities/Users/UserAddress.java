package com.example.smart_mall_spring.Entities.Users;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Address;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserAddress extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String recipient;

    private String phoneNumber;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    private boolean isDefault;
}
