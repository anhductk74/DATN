package com.example.smart_mall_spring.Entities.Users;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Enum.AddressType;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Entities.Address;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(exclude = "user")
public class UserAddress extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String recipient;

    private String phoneNumber;

    private AddressType addressType;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    private boolean isDefault;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;
}
