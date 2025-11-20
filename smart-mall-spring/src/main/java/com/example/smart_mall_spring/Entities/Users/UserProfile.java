package com.example.smart_mall_spring.Entities.Users;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Enum.Gender;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@ToString(exclude = "user")
@EqualsAndHashCode(callSuper = true)
public class UserProfile extends BaseEntity {

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "gender")
    private Gender gender;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    @JsonIgnore
    private User user;

}
