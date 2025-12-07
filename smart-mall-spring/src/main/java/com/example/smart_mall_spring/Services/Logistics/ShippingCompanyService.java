package com.example.smart_mall_spring.Services.Logistics;



import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyListDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseResponseDto;
import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Logistics.ShippingCompany;
import com.example.smart_mall_spring.Enum.ShippingCompanyStatus;

import com.example.smart_mall_spring.Repositories.Logistics.ShippingCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ShippingCompanyService {

    private final ShippingCompanyRepository shippingCompanyRepository;

    //  Tạo mới công ty vận chuyển
    public ShippingCompanyResponseDto create(ShippingCompanyRequestDto dto) {
        ShippingCompany entity = new ShippingCompany();
        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        entity.setContactEmail(dto.getContactEmail());
        entity.setContactPhone(dto.getContactPhone());
        
        // Tạo address nếu có đủ thông tin
        if (dto.getCommune() != null && dto.getDistrict() != null && dto.getCity() != null) {
            Address address = new Address();
            address.setStreet(dto.getStreet() != null ? dto.getStreet() : "");
            address.setCommune(dto.getCommune());
            address.setDistrict(dto.getDistrict());
            address.setCity(dto.getCity());
            entity.setHeadquartersAddress(address);
        }
        
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : ShippingCompanyStatus.ACTIVE);

        ShippingCompany saved = shippingCompanyRepository.save(entity);
        return toResponseDto(saved);
    }

    //  Cập nhật công ty vận chuyển
    public ShippingCompanyResponseDto update(UUID id, ShippingCompanyRequestDto dto) {
        ShippingCompany existing = shippingCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty vận chuyển với id: " + id));

        existing.setName(dto.getName());
        existing.setCode(dto.getCode());
        existing.setContactEmail(dto.getContactEmail());
        existing.setContactPhone(dto.getContactPhone());
        
        // Cập nhật address
        if (dto.getCommune() != null && dto.getDistrict() != null && dto.getCity() != null) {
            Address address = existing.getHeadquartersAddress();
            if (address == null) {
                address = new Address();
            }
            address.setStreet(dto.getStreet() != null ? dto.getStreet() : "");
            address.setCommune(dto.getCommune());
            address.setDistrict(dto.getDistrict());
            address.setCity(dto.getCity());
            existing.setHeadquartersAddress(address);
        } else {
            existing.setHeadquartersAddress(null);
        }
        
        existing.setStatus(dto.getStatus());

        ShippingCompany updated = shippingCompanyRepository.save(existing);
        return toResponseDto(updated);
    }

    //  Lấy danh sách tất cả
    public List<ShippingCompanyListDto> getAll() {
        return shippingCompanyRepository.findAll()
                .stream()
                .map(sc -> new ShippingCompanyListDto(sc.getId(), sc.getName(), sc.getCode(), sc.getStatus()))
                .collect(Collectors.toList());
    }

    //  Tìm kiếm theo tên
    public List<ShippingCompanyListDto> searchByName(String name) {
        return shippingCompanyRepository.searchByName(name)
                .stream()
                .map(sc -> new ShippingCompanyListDto(sc.getId(), sc.getName(), sc.getCode(), sc.getStatus()))
                .collect(Collectors.toList());
    }

    //  Lấy chi tiết
    public ShippingCompanyResponseDto getById(UUID id) {
        ShippingCompany entity = shippingCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty vận chuyển với id: " + id));
        return toResponseDto(entity);
    }

    //  Xoá công ty
    public void delete(UUID id) {
        if (!shippingCompanyRepository.existsById(id)) {
            throw new RuntimeException("Không tồn tại công ty vận chuyển với id: " + id);
        }
        shippingCompanyRepository.deleteById(id);
    }

    //  Mapping entity → DTO
    private ShippingCompanyResponseDto toResponseDto(ShippingCompany entity) {
        Address address = entity.getHeadquartersAddress();
        String fullAddress = null;
        
        if (address != null) {
            StringBuilder sb = new StringBuilder();
            if (address.getStreet() != null && !address.getStreet().isEmpty()) {
                sb.append(address.getStreet()).append(", ");
            }
            sb.append(address.getCommune()).append(", ")
              .append(address.getDistrict()).append(", ")
              .append(address.getCity());
            fullAddress = sb.toString();
        }
        
        return ShippingCompanyResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .contactEmail(entity.getContactEmail())
                .contactPhone(entity.getContactPhone())
                .street(address != null ? address.getStreet() : null)
                .commune(address != null ? address.getCommune() : null)
                .district(address != null ? address.getDistrict() : null)
                .city(address != null ? address.getCity() : null)
                .fullAddress(fullAddress)
                .status(entity.getStatus())
                // 🧩 Danh sách Shipper object
                .shippers(entity.getShippers() != null
                        ? entity.getShippers().stream().map(s -> {
                                var profile = s.getUser() != null ? s.getUser().getProfile() : null;
                                
                                // Lấy khu vực hoạt động
                                Address opRegion = s.getOperationalRegion();
                                String operationalCommune = opRegion != null ? opRegion.getCommune() : null;
                                String operationalDistrict = opRegion != null ? opRegion.getDistrict() : null;
                                String operationalCity = opRegion != null ? opRegion.getCity() : null;
                                String operationalRegionFull = null;
                                if (opRegion != null) {
                                    operationalRegionFull = String.format("%s, %s, %s", 
                                        operationalCommune != null ? operationalCommune : "",
                                        operationalDistrict != null ? operationalDistrict : "",
                                        operationalCity != null ? operationalCity : "").replaceAll("^, |, $", "");
                                }
                                
                                return ShipperResponseDto.builder()
                                        .id(s.getId())
                                        .fullName(profile != null ? profile.getFullName() : null)
                                        .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                                        .avatar(profile != null ? profile.getAvatar() : null)
                                        .gender(profile != null ? profile.getGender() : null)
                                        .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                                        .status(s.getStatus())
                                        .currentLatitude(s.getCurrentLatitude())
                                        .currentLongitude(s.getCurrentLongitude())
                                        .vehicleType(s.getVehicleType())
                                        .licensePlate(s.getLicensePlate())
                                        .vehicleBrand(s.getVehicleBrand())
                                        .vehicleColor(s.getVehicleColor())
                                        .operationalCommune(operationalCommune)
                                        .operationalDistrict(operationalDistrict)
                                        .operationalCity(operationalCity)
                                        .operationalRegionFull(operationalRegionFull)
                                        .maxDeliveryRadius(s.getMaxDeliveryRadius())
                                        .idCardNumber(s.getIdCardNumber())
                                        .driverLicenseNumber(s.getDriverLicenseNumber())
                                        .shippingCompanyId(entity.getId())
                                        .shippingCompanyName(entity.getName())
                                        .userId(s.getUser() != null ? s.getUser().getId() : null)
                                        .username(s.getUser() != null ? s.getUser().getUsername() : null)
                                        .build();
                            })
                        .collect(Collectors.toList())
                        : null)
                // 🧩 Danh sách Warehouse object
                .warehouses(entity.getWarehouses() != null
                        ? entity.getWarehouses().stream().map(w -> WarehouseResponseDto.builder()
                                .id(w.getId())
                                .name(w.getName())
                                .address(w.getAddress())
                                .region(w.getRegion())
                                .managerName(w.getManagerName())
                                .phone(w.getPhone())
                                .status(w.getStatus())
                                .province(w.getProvince())
                                .district(w.getDistrict())
                                .ward(w.getWard())
                                .shippingCompanyId(entity.getId())
                                .shippingCompanyName(entity.getName())
                                .build())
                        .collect(Collectors.toList())
                        : null)
                .build();
    }
}
