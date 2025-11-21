package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipperTransaction.ShipperTransactionRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipperTransaction.ShipperTransactionResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Entities.Logistics.ShipperTransaction;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Entities.Logistics.SubShipmentOrder;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperTransactionRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentOrderRepository;
import com.example.smart_mall_spring.Repositories.Logistics.SubShipmentOrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipperTransactionService {

    private final ShipperTransactionRepository shipperTransactionRepository;
    private final ShipperRepository shipperRepository;
    private final ShipmentOrderRepository shipmentOrderRepository;
    private final SubShipmentOrderRepository subShipmentOrderRepository;
    private final ShipmentReportService shipmentReportService;

    private ShipperTransactionResponseDto toResponseDto(ShipperTransaction entity) {

        UUID shipmentOrderId = entity.getShipmentOrder() != null
                ? entity.getShipmentOrder().getId()
                : null;

        String shipmentOrderCode = (entity.getShipmentOrder() != null &&
                entity.getShipmentOrder().getOrder() != null)
                ? entity.getShipmentOrder().getOrder().getId().toString()
                : null;

        return ShipperTransactionResponseDto.builder()
                .id(entity.getId())
                .shipperId(entity.getShipper().getId())
                .shipperName(entity.getShipper().getFullName())
                .shipmentOrderId(shipmentOrderId)
                .shipmentOrderCode(shipmentOrderCode)
                .subShipmentOrderId(entity.getSubShipmentOrder() != null ? entity.getSubShipmentOrder().getId() : null)
                .amount(entity.getAmount())
                .transactionType(entity.getTransactionType())
                .createdAt(entity.getCreatedAt())
                .build();
    }
    private ShipperTransaction toEntity(ShipperTransactionRequestDto dto) {

        Shipper shipper = shipperRepository.findById(dto.getShipperId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Shipper!"));

        ShipperTransaction tx = new ShipperTransaction();
        tx.setShipper(shipper);
        tx.setAmount(dto.getAmount());
        tx.setTransactionType(dto.getTransactionType());

        // ================================
        // GIAO DỊCH BẮT BUỘC CÓ ĐƠN HÀNG
        // ================================
        if (dto.getTransactionType() == ShipperTransactionType.COLLECT_COD ||
                dto.getTransactionType() == ShipperTransactionType.RETURN_COD ||
                dto.getTransactionType() == ShipperTransactionType.BONUS) {

            if (dto.getShipmentOrderId() == null) {
                throw new IllegalArgumentException("shipmentOrderId là bắt buộc!");
            }

            ShipmentOrder order = shipmentOrderRepository.findById(dto.getShipmentOrderId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ShipmentOrder"));

            tx.setShipmentOrder(order);
        }

        // ================================
        // GIAO DỊCH KHÔNG CẦN ĐƠN HÀNG
        // PAY_FEE, DEPOSIT_COD
        // ================================
        // Không làm gì — transaction chỉ cần shipper + amount

        // Nếu có subShipmentOrderId thì load
        if (dto.getSubShipmentOrderId() != null) {
            SubShipmentOrder sub = subShipmentOrderRepository.findById(dto.getSubShipmentOrderId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy SubShipmentOrder"));
            tx.setSubShipmentOrder(sub);
        }

        return tx;
    }

    public List<ShipperTransactionResponseDto> getAll() {
        return shipperTransactionRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public ShipperTransactionResponseDto getById(UUID id) {
        ShipperTransaction transaction = shipperTransactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch với ID: " + id));
        return toResponseDto(transaction);
    }

    public List<ShipperTransactionResponseDto> getByShipper(UUID shipperId) {
        return shipperTransactionRepository.findByShipper_Id(shipperId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<ShipperTransactionResponseDto> getByShipmentOrder(UUID orderId) {
        return shipperTransactionRepository.findByShipmentOrder_Id(orderId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
    public ShipperTransactionResponseDto create(ShipperTransactionRequestDto dto) {

        // Chỉ check trùng khi liên quan ShipmentOrder
        if (dto.getTransactionType() == ShipperTransactionType.COLLECT_COD ||
                dto.getTransactionType() == ShipperTransactionType.RETURN_COD ||
                dto.getTransactionType() == ShipperTransactionType.BONUS) {

            if (dto.getShipmentOrderId() == null) {
                throw new IllegalArgumentException("shipmentOrderId là bắt buộc!");
            }

            boolean exists = shipperTransactionRepository
                    .existsByShipmentOrder_IdAndTransactionType(dto.getShipmentOrderId(), dto.getTransactionType());

            if (exists) {
                throw new IllegalStateException("Giao dịch này đã tồn tại!");
            }
        }

        ShipperTransaction saved = shipperTransactionRepository.save(toEntity(dto));

        // Cập nhật báo cáo nếu thu COD
        if (saved.getTransactionType() == ShipperTransactionType.COLLECT_COD) {
            shipmentReportService.updateReportByShipment(saved.getShipmentOrder());
        }

        return toResponseDto(saved);
    }

    public void delete(UUID id) {
        ShipperTransaction transaction = shipperTransactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giao dịch với ID: " + id));
        shipperTransactionRepository.delete(transaction);
    }
    public void createTransactionForDeliveredShipment(ShipmentOrder shipmentOrder) {

        // Không có COD thì không tạo transaction
        if (shipmentOrder.getCodAmount() == null
                || shipmentOrder.getCodAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // Chỉ tạo transaction khi đơn đã giao thành công
        if (!shipmentOrder.getStatus().equals(ShipmentStatus.DELIVERED)) {
            return;
        }

        boolean exists = shipperTransactionRepository
                .existsByShipmentOrder_IdAndTransactionType(shipmentOrder.getId(), ShipperTransactionType.COLLECT_COD);

        if (exists) return;

        // Chuẩn bị DTO để đi đúng flow create()
        ShipperTransactionRequestDto dto = new ShipperTransactionRequestDto();
        dto.setShipperId(shipmentOrder.getShipper().getId());
        dto.setShipmentOrderId(shipmentOrder.getId());
        dto.setAmount(shipmentOrder.getCodAmount());
        dto.setTransactionType(ShipperTransactionType.COLLECT_COD);

        // ĐI ĐÚNG LUỒNG CHUẨN
        create(dto);  // ✔ Tự động gọi updateReportByShipment()
    }
    public BigDecimal getTotalCollected(UUID shipperId) {
        return shipperTransactionRepository.findTotalCollected(shipperId);
    }

    // Tổng tiền shipper trả cho công ty
    public BigDecimal getTotalPaid(UUID shipperId) {
        return shipperTransactionRepository.findTotalByType(shipperId, ShipperTransactionType.PAY_FEE);
    }

    // Tổng hợp doanh thu
    public Map<String, BigDecimal> getRevenueSummary(UUID shipperId) {
        BigDecimal totalCollected = getTotalCollected(shipperId);        // thu COD
        BigDecimal totalPaid = getTotalPaid(shipperId);                 // nộp COD
        BigDecimal totalBonus = getTotalBonus(shipperId);               // tiền công
        BigDecimal balanceCOD = totalCollected.subtract(totalPaid);     // shipper đang giữ
        BigDecimal netIncome = totalBonus.subtract(BigDecimal.ZERO);    // thu nhập shipper

        Map<String, BigDecimal> result = new HashMap<>();
        result.put("totalCollected", totalCollected);
        result.put("totalPaid", totalPaid);
        result.put("codBalance", balanceCOD);
        result.put("totalBonus", totalBonus);
        result.put("netIncome", netIncome);

        return result;
    }
    public void createBonusForDeliveredShipment(ShipmentOrder shipmentOrder) {

        // Chỉ tạo khi đơn DELIVERED
        if (!shipmentOrder.getStatus().equals(ShipmentStatus.DELIVERED)) {
            return;
        }

        // Kiểm tra tránh tạo trùng
        boolean exists = shipperTransactionRepository
                .existsByShipmentOrder_IdAndTransactionType(shipmentOrder.getId(), ShipperTransactionType.BONUS);

        if (exists) return;

        ShipperTransaction tx = new ShipperTransaction();
        tx.setShipper(shipmentOrder.getShipper());
        tx.setShipmentOrder(shipmentOrder);
        tx.setTransactionType(ShipperTransactionType.BONUS);

        // tiền công shipper — bạn có thể config trong DB sau
        tx.setAmount(BigDecimal.valueOf(7000));

        shipperTransactionRepository.save(tx);
    }
    public BigDecimal getTotalBonus(UUID shipperId) {
        return shipperTransactionRepository.findTotalByType(shipperId, ShipperTransactionType.BONUS);
    }
}
