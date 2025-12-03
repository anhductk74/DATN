package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/upload-image")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload một ảnh đơn lẻ (cho mobile app và web)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Only image files are allowed"));
            }

            // Validate file size (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File size must not exceed 10MB"));
            }

            Map<String, String> result = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload nhiều ảnh cùng lúc (cho mobile app và web)
     */
    @PostMapping("/multiple")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files) {
        try {
            // Validate số lượng file
            if (files.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No files provided"));
            }

            if (files.size() > 10) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Maximum 10 files allowed"));
            }

            // Upload từng file
            List<Map<String, String>> results = files.stream()
                    .map(file -> {
                        // Validate file type
                        String contentType = file.getContentType();
                        if (contentType == null || !contentType.startsWith("image/")) {
                            throw new RuntimeException("File " + file.getOriginalFilename() + " is not an image");
                        }

                        // Validate file size
                        if (file.getSize() > 10 * 1024 * 1024) {
                            throw new RuntimeException("File " + file.getOriginalFilename() + " exceeds 10MB");
                        }

                        return cloudinaryService.uploadFile(file);
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to upload images: " + e.getMessage()));
        }
    }

    /**
     * Upload ảnh với folder tùy chỉnh
     */
    @PostMapping("/folder/{folderName}")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFileToFolder(
            @RequestParam("file") MultipartFile file,
            @PathVariable String folderName) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Only image files are allowed"));
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File size must not exceed 10MB"));
            }

            Map<String, String> result = cloudinaryService.uploadFileToFolder(file, folderName);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload ảnh riêng cho TinyMCE (FE yêu cầu response JSON có key = "location")
     */
    @PostMapping("/tinymce")
    public ResponseEntity<Map<String, String>> uploadImageForTinyMCE(@RequestParam("file") MultipartFile file) {
        Map<String, String> result = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Map.of("location", result.get("url"))); // TinyMCE cần "location"
    }

    /**
     * Xóa ảnh theo publicId
     */
    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<String>> deleteFile(@PathVariable String publicId) {
        try {
            cloudinaryService.deleteFile(publicId);
            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete image: " + e.getMessage()));
        }
    }

    /**
     * Lấy thông tin về giới hạn upload
     */
    @GetMapping("/limits")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUploadLimits() {
        Map<String, Object> limits = new HashMap<>();
        limits.put("maxFileSize", "10MB");
        limits.put("maxFileSizeBytes", 10 * 1024 * 1024);
        limits.put("maxFiles", 10);
        limits.put("allowedTypes", List.of("image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"));
        limits.put("allowedExtensions", List.of("jpg", "jpeg", "png", "gif", "webp"));

        return ResponseEntity.ok(ApiResponse.success("Upload limits retrieved successfully", limits));
    }
}
