package com.example.smart_mall_spring.Entities.Users;

import java.time.LocalDateTime;
import java.util.List;

import com.example.smart_mall_spring.Entities.BaseEntity;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = "profile")
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {
    @Column(name = "username", unique = true, nullable = false)
    private String username;
    @Column(name = "password")
    private String password;

    @Column(name = "resetpasswordcode")
    private String resetPasswordCode;

    @Column(name = "resetpasswordcodecreationtime")
    private LocalDateTime resetPasswordCodeCreationTime;

    @Column(name = "is_active", nullable = false, columnDefinition = "int default 0")
    private int isActive;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserProfile profile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserAddress> addresses;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> roles;

}
