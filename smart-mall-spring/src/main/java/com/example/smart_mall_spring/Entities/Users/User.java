package com.example.smart_mall_spring.Entities.Users;

import java.time.LocalDateTime;
import java.util.List;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = {"profile", "addresses", "roles"})
@EqualsAndHashCode(callSuper = true, exclude = {"profile", "addresses", "roles"})
public class User extends BaseEntity {
    @Column(name = "username", unique = true, nullable = false)
    private String username;
    @Column(name = "password")
    private String password;

    @Column(name = "resetpasswordcode")
    private String resetPasswordCode;

    @Column(name = "resetpasswordcodecreationtime")
    private LocalDateTime resetPasswordCodeCreationTime;

    @Column(name = "logincode")
    private String loginCode;

    @Column(name = "logincodecreationtime")
    private LocalDateTime loginCodeCreationTime;

    @Column(name = "is_active", nullable = false, columnDefinition = "int default 0")
    private int isActive;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private UserProfile profile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<UserAddress> addresses;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @JsonIgnore
    private List<Role> roles;

}
