package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Logistic.Manager.ManagerResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.*;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Services.Logistics.ManagerService;
import com.example.smart_mall_spring.Services.Logistics.ShipperService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/managers")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;
    private final ShipperService shipperService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllManagers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(managerService.getAllManagers(search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManagerResponseDto> getManagerById(@PathVariable UUID id) {
        return ResponseEntity.ok(managerService.getManagerById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ManagerResponseDto> getManagerByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(managerService.getManagerByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable UUID id) {
        managerService.deleteManager(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    //   MANAGER QUẢN LÝ SHIPPER CỦA CÔNG TY
    // ==========================================

    /**
     * Manager đăng ký shipper mới cho công ty của mình
     */
    @PostMapping("/shippers/register")
    public ResponseEntity<?> registerShipper(
            @RequestPart("dataInfo") String dataInfoJson,
            @RequestPart(value = "idCardFrontImage", required = false) MultipartFile idCardFrontImage,
            @RequestPart(value = "idCardBackImage", required = false) MultipartFile idCardBackImage,
            @RequestPart(value = "driverLicenseImage", required = false) MultipartFile driverLicenseImage) {
        
        try {
            ShipperInfoDto dataInfo = objectMapper.readValue(dataInfoJson, ShipperInfoDto.class);
            User currentUser = getCurrentUser();
            
            ShipperResponseDto response = shipperService.registerShipper(
                dataInfo, 
                idCardFrontImage, 
                idCardBackImage, 
                driverLicenseImage, 
                currentUser
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid request",
                "message", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()
            ));
        }
    }

    /**
     * Manager xem danh sách shipper của công ty mình
     */
    @GetMapping("/shippers")
    public ResponseEntity<Map<String, Object>> getMyCompanyShippers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(shipperService.getAllShippers(search, status, region, currentUser, page, size));
    }

    /**
     * Manager xem chi tiết shipper của công ty mình
     */
    @GetMapping("/shippers/{id}")
    public ResponseEntity<ShipperResponseDto> getShipperById(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(shipperService.getShipperById(id, currentUser));
    }

    /**
     * Manager cập nhật thông tin shipper của công ty mình
     */
    @PutMapping(
            value = "/shippers/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ShipperResponseDto> updateShipper(
            @PathVariable UUID id,

            @ModelAttribute ShipperUpdateDto dto,

            @RequestPart(required = false) MultipartFile idCardFront,
            @RequestPart(required = false) MultipartFile idCardBack,
            @RequestPart(required = false) MultipartFile driverLicense
    ) {
        User currentUser = getCurrentUser();

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



    /**
     * Manager xóa shipper của công ty mình
     */
    @DeleteMapping("/shippers/{id}")
    public ResponseEntity<Void> deleteShipper(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        shipperService.deleteShipper(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Manager xem thống kê shipper của công ty mình
     */
    @GetMapping("/shippers/statistics")
    public ResponseEntity<ShipperStatisticsResponse> getShipperStatistics() {
        return ResponseEntity.ok(shipperService.getShipperStatistics());
    }

    /**
     * Manager xem thống kê giao hàng của 1 shipper
     */
    @GetMapping("/shippers/{id}/delivery-statistics")
    public ResponseEntity<ShipperDeliveryStatisticsResponse> getShipperDeliveryStats(@PathVariable UUID id) {
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
