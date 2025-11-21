package com.example.smart_mall_spring.Dtos.Users;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserListDto {
    private UUID id;
    private String username;
    private String fullName;
    private List<String> roles;
    private int isActive;
}