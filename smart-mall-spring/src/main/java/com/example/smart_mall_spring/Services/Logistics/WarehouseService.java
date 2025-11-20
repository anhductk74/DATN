package com.example.smart_mall_spring.Services.Logistics;
import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.Warehouse.WarehouseResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.WarehouseInventoryItem.WarehouseStatisticsResponse;
import com.example.smart_mall_spring.Entities.Logistics.ShippingCompany;
import com.example.smart_mall_spring.Entities.Logistics.Warehouse;
import com.example.smart_mall_spring.Enum.WarehouseStatus;
import com.example.smart_mall_spring.Repositories.Logistics.ShippingCompanyRepository;
import com.example.smart_mall_spring.Repositories.Logistics.WarehouseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final ShippingCompanyRepository shippingCompanyRepository;

    // Mapper entity → DTO
    private WarehouseResponseDto toResponseDto(Warehouse entity) {
        return WarehouseResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .address(entity.getAddress())
                .region(entity.getRegion())
                .province(entity.getProvince())
                .district(entity.getDistrict())
                .ward(entity.getWard())
                .managerName(entity.getManagerName())
                .phone(entity.getPhone())
                .status(entity.getStatus())
                .shippingCompanyId(entity.getShippingCompany() != null ? entity.getShippingCompany().getId() : null)
                .shippingCompanyName(entity.getShippingCompany() != null ? entity.getShippingCompany().getName() : null)
                .capacity(entity.getCapacity())
                .currentStock(entity.getCurrentStock() != null ? entity.getCurrentStock() : 0)
                .build();
    }

    // Mapper DTO → entity
    private Warehouse toEntity(WarehouseRequestDto dto) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(dto.getName());
        warehouse.setAddress(dto.getAddress());
        warehouse.setRegion(dto.getRegion());
        warehouse.setProvince(dto.getProvince());
        warehouse.setDistrict(dto.getDistrict());
        warehouse.setWard(dto.getWard());
        warehouse.setManagerName(dto.getManagerName());
        warehouse.setPhone(dto.getPhone());
        warehouse.setStatus(dto.getStatus() != null ? dto.getStatus() : WarehouseStatus.ACTIVE);
        warehouse.setCapacity(dto.getCapacity());

        if (dto.getShippingCompanyId() != null) {
            ShippingCompany company = shippingCompanyRepository.findById(dto.getShippingCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển với ID: " + dto.getShippingCompanyId()));
            warehouse.setShippingCompany(company);
        }

        return warehouse;
    }

    // Lấy danh sách tất cả warehouse
    public List<WarehouseResponseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy theo ID
    public WarehouseResponseDto getWarehouseById(UUID id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kho hàng với ID: " + id));
        return toResponseDto(warehouse);
    }

    // Lấy danh sách theo công ty vận chuyển
    public List<WarehouseResponseDto> getByShippingCompany(UUID companyId) {
        return warehouseRepository.findByShippingCompany_Id(companyId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Tạo mới
    public WarehouseResponseDto createWarehouse(WarehouseRequestDto dto) {
        Warehouse warehouse = toEntity(dto);
        Warehouse saved = warehouseRepository.save(warehouse);
        return toResponseDto(saved);
    }

    // Cập nhật
    public WarehouseResponseDto updateWarehouse(UUID id, WarehouseRequestDto dto) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kho hàng với ID: " + id));

        warehouse.setName(dto.getName());
        warehouse.setAddress(dto.getAddress());
        warehouse.setRegion(dto.getRegion());
        warehouse.setProvince(dto.getProvince());
        warehouse.setDistrict(dto.getDistrict());
        warehouse.setWard(dto.getWard());
        warehouse.setManagerName(dto.getManagerName());
        warehouse.setPhone(dto.getPhone());
        warehouse.setStatus(dto.getStatus() != null ? dto.getStatus() : warehouse.getStatus());
        warehouse.setCapacity(dto.getCapacity());

        if (dto.getShippingCompanyId() != null) {
            ShippingCompany company = shippingCompanyRepository.findById(dto.getShippingCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển với ID: " + dto.getShippingCompanyId()));
            warehouse.setShippingCompany(company);
        }

        Warehouse updated = warehouseRepository.save(warehouse);
        return toResponseDto(updated);
    }

    // Xoá
    public void deleteWarehouse(UUID id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kho hàng với ID: " + id));
        warehouseRepository.delete(warehouse);
    }

    public WarehouseStatisticsResponse getWarehouseStatistics() {
        long total = warehouseRepository.count();
        long active = warehouseRepository.countByStatus(WarehouseStatus.ACTIVE);
        long inactive = warehouseRepository.countByStatus(WarehouseStatus.INACTIVE);
        long maintenance = warehouseRepository.countByStatus(WarehouseStatus.MAINTENANCE);
        long full = warehouseRepository.countByStatus(WarehouseStatus.FULL);
        long temporarilyClosed = warehouseRepository.countByStatus(WarehouseStatus.TEMPORARILY_CLOSED);

        Integer totalCapacity = warehouseRepository.getTotalCapacity();
        Integer totalCurrentStock = warehouseRepository.getTotalCurrentStock();

        return WarehouseStatisticsResponse.builder()
                .total((int) total)
                .active((int) active)
                .inactive((int) inactive)
                .maintenance((int) maintenance)
                .full((int) full)
                .temporarilyClosed((int) temporarilyClosed)
                .totalCapacity(totalCapacity != null ? totalCapacity : 0)
                .totalCurrentStock(totalCurrentStock != null ? totalCurrentStock : 0)
                .build();
    }
    public WarehouseResponseDto updateWarehouseStatus(UUID id, WarehouseStatus status) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kho hàng với ID: " + id));
        warehouse.setStatus(status);
        Warehouse updated = warehouseRepository.save(warehouse);
        return toResponseDto(updated);
    }
}
