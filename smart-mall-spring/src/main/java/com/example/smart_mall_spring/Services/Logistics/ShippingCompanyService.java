package com.example.smart_mall_spring.Services.Logistics;



import com.example.smart_mall_spring.Dtos.Logistic.Shipper.ShipperResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyListDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShippingCompany.ShippingCompanyResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseResponseDto;
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
        entity.setHeadquartersAddress(dto.getHeadquartersAddress());
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
        existing.setHeadquartersAddress(dto.getHeadquartersAddress());
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
        return ShippingCompanyResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .contactEmail(entity.getContactEmail())
                .contactPhone(entity.getContactPhone())
                .headquartersAddress(entity.getHeadquartersAddress())
                .status(entity.getStatus())
                // 🧩 Danh sách Shipper object
                .shippers(entity.getShippers() != null
                        ? entity.getShippers().stream().map(s -> ShipperResponseDto.builder()
                                .id(s.getId())
                                .fullName(s.getFullName())
                                .phoneNumber(s.getPhoneNumber())
                                .email(s.getEmail())
                                .status(s.getStatus())
                                .latitude(s.getLatitude())
                                .longitude(s.getLongitude())
                                .vehicleType(s.getVehicleType())
                                .licensePlate(s.getLicensePlate())
                                .region(s.getRegion())
                                .shippingCompanyId(entity.getId())
                                .shippingCompanyName(entity.getName())
                                .userId(s.getUser() != null ? s.getUser().getId() : null)
                                .username(s.getUser() != null ? s.getUser().getUsername() : null)
                                .build())
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