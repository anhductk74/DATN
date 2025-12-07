package com.example.smart_mall_spring.Entities;

import com.example.smart_mall_spring.Entities.Users.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"owner"})
public class Shop extends BaseEntity {
    @Column(nullable = false)
    private String name;
    
    @Column(length = 12)
    private String cccd;
    
    private String description;
    private String phoneNumber;
    private String avatar;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    @JsonIgnore
    private User owner; // Shop owner
}
