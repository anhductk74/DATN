package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.*;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Services.Logistics.ShipperService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shippers")
@RequiredArgsConstructor
public class ShipperController {

    private final ShipperService shipperService;
    private final ObjectMapper objectMapper;

    /**
     * Register new shipper with separate dataInfo (JSON) and dataImage (files)
     * 
     * Frontend gửi FormData:
     * - dataInfo: JSON string chứa thông tin shipper
     * - idCardFrontImage: File (optional)
     * - idCardBackImage: File (optional)
     * - driverLicenseImage: File (optional)
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerShipper(
            @RequestPart("dataInfo") String dataInfoJson,
            @RequestPart(value = "idCardFrontImage", required = false) MultipartFile idCardFrontImage,
            @RequestPart(value = "idCardBackImage", required = false) MultipartFile idCardBackImage,
            @RequestPart(value = "driverLicenseImage", required = false) MultipartFile driverLicenseImage) {

        try {
            // Parse JSON string to DTO
            ShipperInfoDto dataInfo = objectMapper.readValue(dataInfoJson, ShipperInfoDto.class);

            User currentUser = getCurrentUser();

            ShipperResponseDto response = shipperService.registerShipper(
                    dataInfo,
                    idCardFrontImage,
                    idCardBackImage,
                    driverLicenseImage,
                    currentUser);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (StackOverflowError e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Internal server error",
                    "message", "StackOverflowError occurred during shipper registration"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request",
                    "message", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllShippers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(shipperService.getAllShippers(search, status, region, currentUser, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipperResponseDto> getShipperById(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(shipperService.getShipperById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<ShipperResponseDto> createShipper(@RequestBody ShipperRequestDto dto) {
        return ResponseEntity.ok(shipperService.createShipper(dto));
    }

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ShipperResponseDto> updateShipper(
            @PathVariable UUID id,
            @ModelAttribute ShipperUpdateDto dto,
            @RequestPart(required = false) MultipartFile idCardFront,
            @RequestPart(required = false) MultipartFile idCardBack,
            @RequestPart(required = false) MultipartFile driverLicense,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
                shipperService.updateShipper(
                        id,
                        dto,
                        idCardFront,
                        idCardBack,
                        driverLicense,
                        currentUser
                )
        );
    }


//    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> uploadImage(
//            @PathVariable UUID id,
//            @RequestPart("file") MultipartFile file,
//            @RequestParam("imageType") String imageType) {
//        try {
//            User currentUser = getCurrentUser();
//            String imageUrl = shipperService.uploadImage(id, file, imageType, currentUser);
//            return ResponseEntity.ok(Map.of(
//                    "success", true,
//                    "message", "Upload ảnh thành công",
//                    "data", Map.of("imageUrl", imageUrl)));
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
//                    "success", false,
//                    "message", "Lỗi upload ảnh: " + e.getMessage()));
//        }
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipper(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        shipperService.deleteShipper(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<ShipperStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(shipperService.getShipperStatistics());
    }

    @GetMapping("/{id}/delivery-statistics")
    public ResponseEntity<ShipperDeliveryStatisticsResponse> getDeliveryStats(
            @PathVariable UUID id) {
        return ResponseEntity.ok(shipperService.getShipperDeliveryStatistics(id));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getUser();
        }
        return null;
    }
}