package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog.ShipmentLogRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog.ShipmentLogResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentLog;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Entities.Logistics.SubShipmentOrder;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentLogRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentOrderRepository;
import com.example.smart_mall_spring.Repositories.Logistics.SubShipmentOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentLogService {

    private final ShipmentLogRepository shipmentLogRepository;
    private final ShipmentOrderRepository shipmentOrderRepository;
    private final SubShipmentOrderRepository subShipmentOrderRepository;

    // Mapper nội bộ
    private ShipmentLogResponseDto toDto(ShipmentLog entity) {
        return ShipmentLogResponseDto.builder()
                .id(entity.getId())
                .shipmentOrderId(entity.getShipmentOrder() != null ? entity.getShipmentOrder().getId() : null)
                .subShipmentOrderId(entity.getSubShipmentOrder() != null ? entity.getSubShipmentOrder().getId() : null)
                .status(entity.getStatus())
                .location(entity.getLocation())
                .note(entity.getNote())
                .message(entity.getMessage())
                .timestamp(entity.getTimestamp())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private ShipmentLog toEntity(ShipmentLogRequestDto dto) {

        ShipmentOrder order = shipmentOrderRepository.findById(dto.getShipmentOrderId())
                .orElseThrow(() -> new RuntimeException("Shipment order not found"));

        ShipmentLog log = new ShipmentLog();
        log.setShipmentOrder(order);
        log.setStatus(dto.getStatus());
        log.setLocation(dto.getLocation());
        log.setNote(dto.getNote());
        log.setMessage(dto.getNote());      // hoặc dto.getMessage() nếu FE gửi
        log.setTimestamp(LocalDateTime.now());

        // Nếu có subShipmentOrderId → gắn vào log
        if (dto.getSubShipmentOrderId() != null) {
            SubShipmentOrder sub = subShipmentOrderRepository.findById(dto.getSubShipmentOrderId())
                    .orElseThrow(() -> new RuntimeException("SubShipmentOrder not found"));
            log.setSubShipmentOrder(sub);
        }

        return log;
    }

    public List<ShipmentLogResponseDto> getAllLogs() {
        return shipmentLogRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ShipmentLogResponseDto getLogById(UUID id) {
        return shipmentLogRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Shipment log not found"));
    }

    public List<ShipmentLogResponseDto> getLogsByShipmentOrder(UUID shipmentOrderId) {
        return shipmentLogRepository.findByShipmentOrder_Id(shipmentOrderId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ShipmentLogResponseDto createLog(ShipmentLogRequestDto dto) {
        ShipmentLog entity = toEntity(dto);
        return toDto(shipmentLogRepository.save(entity));
    }

    public void deleteLog(UUID id) {
        shipmentLogRepository.deleteById(id);
    }
}