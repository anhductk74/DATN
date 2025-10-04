package com.example.smart_mall_spring.Services.Users;

import com.example.smart_mall_spring.Dtos.Auth.UserInfoDto;
import com.example.smart_mall_spring.Dtos.Users.UpdateUserProfileDto;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserProfile;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    
    @Autowired
    private PasswordEncoder passwordEncoder;

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
        if (updateProfileDto.getGender() != null) {
            profile.setGender(updateProfileDto.getGender());
        }
        if (updateProfileDto.getDateOfBirth() != null) {
            profile.setDateOfBirth(updateProfileDto.getDateOfBirth());
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
            if (updateProfileDto.getGender() != null) {
                profile.setGender(updateProfileDto.getGender());
            }
            if (updateProfileDto.getDateOfBirth() != null) {
                profile.setDateOfBirth(updateProfileDto.getDateOfBirth());
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

    // Update user profile with avatar from DTO (for unified endpoint)
    public UserInfoDto updateUserProfileWithAvatar(UUID userId, UpdateUserProfileDto updateProfileDto, MultipartFile avatarFile) {
        try {
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
            if (updateProfileDto.getGender() != null) {
                profile.setGender(updateProfileDto.getGender());
            }
            if (updateProfileDto.getDateOfBirth() != null) {
                profile.setDateOfBirth(updateProfileDto.getDateOfBirth());
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

    // Change user password
    public void changePassword(UUID userId, String currentPassword, String newPassword, String confirmPassword) {
        // Validation
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new RuntimeException("New password cannot be empty");
        }
        
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("New password and confirm password do not match");
        }
        
        if (newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check current password (skip for Google OAuth users)
        if (!user.getPassword().startsWith("GOOGLE_OAUTH_")) {
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                throw new RuntimeException("Current password is required");
            }
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
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
                .gender(profile != null ? profile.getGender() : null)
                .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                .isActive(user.getIsActive())
                .roles(roleNames)
                .build();
    }
}