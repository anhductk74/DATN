package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperDeliveryStatisticsResponse;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperStatisticsResponse;
import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Entities.Logistics.ShippingCompany;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentOrderRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShippingCompanyRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ShipperService {

    private final ShipperRepository shipperRepository;
    private final ShippingCompanyRepository shippingCompanyRepository;
    private final ShipmentOrderRepository shipmentOrderRepository;
    private final UserRepository userRepository;

    // ============================
    //      SHIPPER STATISTICS
    // ============================
    public ShipperStatisticsResponse getShipperStatistics() {
        long total = shipperRepository.countAllShippers();

        long active = shipperRepository.countByStatus(ShipperStatus.ACTIVE);
        long busy = shipperRepository.countByStatus(ShipperStatus.BUSY);
        long inactive = shipperRepository.countByStatus(ShipperStatus.INACTIVE);
        long onLeave = shipperRepository.countByStatus(ShipperStatus.ON_LEAVE);
        long suspended = shipperRepository.countByStatus(ShipperStatus.SUSPENDED);

        return ShipperStatisticsResponse.builder()
                .total(total)
                .active(active)
                .busy(busy)
                .inactive(inactive)
                .onLeave(onLeave)
                .suspended(suspended)
                .build();
    }

    // ===================================
    //      SHIPPER DELIVERY STATISTICS
    // ===================================
    public ShipperDeliveryStatisticsResponse getShipperDeliveryStatistics(UUID shipperId) {

        long totalDeliveries = shipmentOrderRepository.countByShipperId(shipperId);

        long successfulDeliveries =
                shipmentOrderRepository.countByShipperIdAndStatus(shipperId, ShipmentStatus.DELIVERED);

        long failedDeliveries =
                shipmentOrderRepository.countByShipperIdAndStatus(shipperId, ShipmentStatus.CANCELLED);


        double successRate = totalDeliveries == 0
                ? 0
                : (double) successfulDeliveries / totalDeliveries * 100;

        return ShipperDeliveryStatisticsResponse.builder()
                .totalDeliveries(totalDeliveries)
                .successfulDeliveries(successfulDeliveries)
                .failedDeliveries(failedDeliveries)
                .successRate(successRate)
                .build();
    }

    // Lấy tất cả shipper
    public Map<String, Object> getAllShippers(String search, String status, String region, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Shipper> shipperPage = shipperRepository.findAll(pageable);

        // Lọc thủ công trong Java
        List<ShipperResponseDto> filtered = shipperPage.getContent().stream()
                .filter(shipper -> {
                    boolean matches = true;
                    if (search != null && !search.isEmpty()) {
                        matches &= shipper.getFullName().toLowerCase().contains(search.toLowerCase())
                                || shipper.getPhoneNumber().contains(search)
                                || shipper.getEmail().toLowerCase().contains(search.toLowerCase());
                    }
                    if (status != null && !status.isEmpty()) {
                        matches &= shipper.getStatus().name().equalsIgnoreCase(status);
                    }
                    if (region != null && !region.isEmpty()) {
                        matches &= shipper.getRegion() != null && shipper.getRegion().equalsIgnoreCase(region);
                    }
                    return matches;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", filtered);
        response.put("currentPage", page);
        response.put("totalItems", shipperPage.getTotalElements());
        response.put("totalPages", shipperPage.getTotalPages());
        return response;
    }

    // Lấy shipper theo ID
    public ShipperResponseDto getShipperById(UUID id) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shipper với ID: " + id));
        return mapToDto(shipper);
    }

    // Tạo mới shipper
    public ShipperResponseDto createShipper(ShipperRequestDto dto) {
        if (shipperRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại: " + dto.getPhoneNumber());
        }

        ShippingCompany company = shippingCompanyRepository.findById(dto.getShippingCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển với ID: " + dto.getShippingCompanyId()));

        // Kiểm tra user tồn tại
        var user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + dto.getUserId()));

        //  (tuỳ chọn) kiểm tra user có role phù hợp không
        boolean hasShipperRole = user.getRoles()
                .stream()
                .anyMatch(role -> "SHIPPER".equalsIgnoreCase(role.getName()));

        if (!hasShipperRole) {
            throw new IllegalArgumentException("User không có quyền SHIPPER");
        }

        Shipper shipper = new Shipper();
        shipper.setShippingCompany(company);
        shipper.setFullName(dto.getFullName());
        shipper.setPhoneNumber(dto.getPhoneNumber());
        shipper.setEmail(dto.getEmail());
        shipper.setStatus(dto.getStatus());
        shipper.setLatitude(dto.getLatitude());
        shipper.setLongitude(dto.getLongitude());
        shipper.setUser(user);
        shipper.setVehicleType(dto.getVehicleType());
        shipper.setLicensePlate(dto.getLicensePlate());
        shipper.setRegion(dto.getRegion());// gán user vào shipper

        Shipper saved = shipperRepository.save(shipper);
        return mapToDto(saved);
    }

    // Cập nhật shipper
    public ShipperResponseDto updateShipper(UUID id, ShipperRequestDto dto) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shipper với ID: " + id));

        if (dto.getShippingCompanyId() != null) {
            ShippingCompany company = shippingCompanyRepository.findById(dto.getShippingCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển với ID: " + dto.getShippingCompanyId()));
            shipper.setShippingCompany(company);
        }

        if (dto.getFullName() != null) shipper.setFullName(dto.getFullName());
        if (dto.getPhoneNumber() != null) shipper.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getEmail() != null) shipper.setEmail(dto.getEmail());
        if (dto.getStatus() != null) shipper.setStatus(dto.getStatus());
        if (dto.getLatitude() != null) shipper.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) shipper.setLongitude(dto.getLongitude());
        if (dto.getVehicleType() != null) shipper.setVehicleType(dto.getVehicleType());
        if (dto.getLicensePlate() != null) shipper.setLicensePlate(dto.getLicensePlate());
        if (dto.getRegion() != null) shipper.setRegion(dto.getRegion());

        Shipper updated = shipperRepository.save(shipper);
        return mapToDto(updated);
    }

    // Xóa shipper
    public void deleteShipper(UUID id) {
        if (!shipperRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy shipper với ID: " + id);
        }
        shipperRepository.deleteById(id);
    }

    // Mapper chuyển đổi entity -> DTO
    private ShipperResponseDto mapToDto(Shipper entity) {
        return ShipperResponseDto.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .phoneNumber(entity.getPhoneNumber())
                .email(entity.getEmail())
                .status(entity.getStatus())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .vehicleType(entity.getVehicleType())
                .licensePlate(entity.getLicensePlate())
                .region(entity.getRegion())
                .shippingCompanyId(entity.getShippingCompany() != null ? entity.getShippingCompany().getId() : null)
                .shippingCompanyName(entity.getShippingCompany() != null ? entity.getShippingCompany().getName() : null)
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .username(entity.getUser() != null ? entity.getUser().getUsername() : null)
                .build();
    }
}
