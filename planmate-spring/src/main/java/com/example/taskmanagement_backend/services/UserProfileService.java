package com.example.taskmanagement_backend.services;

import com.example.taskmanagement_backend.dtos.UserProfileDto.CreateUserProfileRequestDto;
import com.example.taskmanagement_backend.dtos.UserProfileDto.UpdateUserProfileRequestDto;
import com.example.taskmanagement_backend.dtos.UserProfileDto.UserProfileResponseDto;
import com.example.taskmanagement_backend.entities.Project;
import com.example.taskmanagement_backend.entities.User;
import com.example.taskmanagement_backend.entities.UserProfile;
import com.example.taskmanagement_backend.repositories.UserJpaRepository;
import com.example.taskmanagement_backend.repositories.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.stream.Collectors;
@RequiredArgsConstructor
@Service
public class UserProfileService {
    @Autowired
    private final UserProfileRepository userProfileRepository;
    private final UserJpaRepository userJpaRepository;
    private final String uploadDir = "uploads/";

    public UserProfileResponseDto getUserProfile(Long id) {
        return userProfileRepository.findByUserId(id)
                .map(this::convertToDto)
                .orElse(null);
    }

    public UserProfileResponseDto updateUserProfile(Long uid, UpdateUserProfileRequestDto dto) {
        UserProfile userProfile = convertToEntity(getUserProfile(uid));
        System.out.println("userProfile: "+userProfile);
                if(dto.getFirstName() != null ) userProfile.setFirstName(dto.getFirstName());
                if(dto.getLastName() != null ) userProfile.setLastName(dto.getLastName());
                String localPath = copyImageToServer(dto.getAvtUrl());
                if(dto.getAvtUrl() != null ) userProfile.setAvtUrl(localPath);
                User user = getUser(uid);
                if(user.isFirstLogin()) {
                    user.setFirstLogin(false);
                    userJpaRepository.save(user);
                }
        return convertToDto(userProfileRepository.save(userProfile));
    }
    public String copyImageToServer(String sourcePath) {
        try {
            Path source = Paths.get(sourcePath);
            // Đảm bảo thư mục tồn tại
            File uploadFolder = new File(uploadDir);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
            }

            // Tạo tên file duy nhất
            String fileName = UUID.randomUUID() + "_" + source.getFileName().toString();
            Path target = Paths.get(uploadDir, fileName);

            Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);

            // Trả về path tương đối để truy cập ảnh sau này
            return "/images/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Không thể copy file: " + e.getMessage());
        }
    }

    public UserProfileResponseDto convertToDto(UserProfile userProfile) {
        UserProfileResponseDto userProfileResponseDto = new UserProfileResponseDto();
        userProfileResponseDto.setId(userProfile.getId());
        userProfileResponseDto.setFirstName(userProfile.getFirstName());
        userProfileResponseDto.setLastName(userProfile.getLastName());
        userProfileResponseDto.setStatus(userProfile.getStatus());
        userProfileResponseDto.setAvtUrl(userProfile.getAvtUrl());
        userProfileResponseDto.setUserId(userProfile.getUser() != null ? userProfile.getUser().getId() : null);
        return userProfileResponseDto;
    }

    public UserProfile  convertToEntity(UserProfileResponseDto dto) {
        UserProfile userProfile = new UserProfile();
        userProfile.setId(dto.getId());
        userProfile.setFirstName(dto.getFirstName());
        userProfile.setLastName(dto.getLastName());
        userProfile.setStatus(dto.getStatus());
        userProfile.setAvtUrl(dto.getAvtUrl());
        userProfile.setUser(dto.getUserId() != null ? getUser(dto.getUserId()) : null);
        return userProfile;
    }

    private User getUser(Long id) {
        return id != null ? userJpaRepository.findById(id).orElse(null) : null;
    }
}
