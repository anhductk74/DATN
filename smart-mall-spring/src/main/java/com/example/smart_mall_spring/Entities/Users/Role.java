package com.example.smart_mall_spring.Entities.Users;

import java.util.List;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "roles", indexes = {
        @Index(name = "idx_role_name", columnList = "name", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = true)

public class Role extends BaseEntity {

    private String code;
    private String name;

    @ManyToMany(mappedBy = "roles")
    @JsonIgnore
    private List<User> users;
}
