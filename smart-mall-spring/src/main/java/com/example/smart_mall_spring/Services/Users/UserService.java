package com.example.smart_mall_spring.Services.Users;

import com.example.smart_mall_spring.Dtos.Auth.UserInfoDto;
import com.example.smart_mall_spring.Dtos.Users.UpdateUserProfileDto;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserProfile;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private ObjectMapper objectMapper;

    // Update user profile
    public UserInfoDto updateUserProfile(UUID userId, UpdateUserProfileDto updateProfileDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }

        // Update profile fields if provided
        if (updateProfileDto.getFullName() != null) {
            profile.setFullName(updateProfileDto.getFullName());
        }
        if (updateProfileDto.getPhoneNumber() != null) {
            profile.setPhoneNumber(updateProfileDto.getPhoneNumber());
        }

        user = userRepository.save(user);
        return convertUserToInfoDto(user);
    }

    // Update user profile with avatar
    public UserInfoDto updateUserProfileWithAvatar(UUID userId, String profileDataJson, MultipartFile avatarFile) {
        try {
            UpdateUserProfileDto updateProfileDto = objectMapper.readValue(profileDataJson, UpdateUserProfileDto.class);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            UserProfile profile = user.getProfile();
            if (profile == null) {
                profile = new UserProfile();
                profile.setUser(user);
                user.setProfile(profile);
            }

            // Update profile fields if provided
            if (updateProfileDto.getFullName() != null) {
                profile.setFullName(updateProfileDto.getFullName());
            }
            if (updateProfileDto.getPhoneNumber() != null) {
                profile.setPhoneNumber(updateProfileDto.getPhoneNumber());
            }

            // Upload avatar to Cloudinary if provided
            if (avatarFile != null && !avatarFile.isEmpty()) {
                Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(avatarFile, "avatar");
                String avatarUrl = uploadResult.get("url");
                profile.setAvatar(avatarUrl);
            }

            user = userRepository.save(user);
            return convertUserToInfoDto(user);

        } catch (Exception e) {
            throw new RuntimeException("Failed to update user profile: " + e.getMessage());
        }
    }

    // Get user profile by ID
    public UserInfoDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertUserToInfoDto(user);
    }

    // Convert User entity to UserInfoDto
    private UserInfoDto convertUserToInfoDto(User user) {
        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toList())
                : List.of();

        UserProfile profile = user.getProfile();

        return UserInfoDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(profile != null ? profile.getFullName() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .avatar(profile != null ? profile.getAvatar() : null)
                .isActive(user.getIsActive())
                .roles(roleNames)
                .build();
    }
}