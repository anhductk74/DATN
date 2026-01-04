package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder.ShipmentOrderRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentOrder.ShipmentOrderResponseDto;
import com.example.smart_mall_spring.Dtos.WebSocket.DeliveryMessage;
import com.example.smart_mall_spring.Entities.Logistics.*;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import com.example.smart_mall_spring.Repositories.Logistics.*;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Services.DeliverySocketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentOrderService {

    private final ShipmentOrderRepository shipmentOrderRepository;
    private final OrderRepository orderRepository;
    private final ShipperRepository shipperRepository;
    private final ShipmentLogRepository shipmentLogRepository;
    private final WarehouseRepository warehouseRepository;
    private final SubShipmentOrderRepository subShipmentOrderRepository;
    private final ShipperTransactionService shipperTransactionService;
    private final ShipmentReportService shipmentReportService;
    private final GhtkService ghtkService; //  Thêm GhtkService vào
    private final DeliverySocketService  deliverySocketService;

    // ========== Mapper ==========
    public ShipmentOrderResponseDto toResponseDto(ShipmentOrder entity) {
        String recipientName = null;
        String recipientPhone = null;

        if (entity.getOrder() != null && entity.getOrder().getShippingAddress() != null) {
            var shippingAddress = entity.getOrder().getShippingAddress();
            recipientName = shippingAddress.getRecipient();
            recipientPhone = shippingAddress.getPhoneNumber();
        }
        return ShipmentOrderResponseDto.builder()
                .id(entity.getId())
                .orderCode(entity.getOrder() != null ? entity.getOrder().getId().toString() : null)
                .shipperName(entity.getShipper() != null && entity.getShipper().getUser() != null && entity.getShipper().getUser().getProfile() != null 
                    ? entity.getShipper().getUser().getProfile().getFullName() : null)
                .warehouseName(entity.getWarehouse() != null ? entity.getWarehouse().getName() : null)
                .warehouseId(entity.getWarehouse() != null ? entity.getWarehouse().getId().toString() : null)
                .pickupAddress(entity.getPickupAddress())
                .deliveryAddress(entity.getDeliveryAddress())
                .recipientName(recipientName)
                .recipientPhone(recipientPhone)
                .codAmount(entity.getCodAmount())
                .shippingFee(entity.getShippingFee())
                .status(entity.getStatus())
                .estimatedDelivery(entity.getEstimatedDelivery())
                .deliveredAt(entity.getDeliveredAt())
                .returnedAt(entity.getReturnedAt())
                .trackingCode(entity.getTrackingCode()) //  thêm trackingCode
                .weight(entity.getWeight())
                .build();
    }
    private void createShipmentLog(ShipmentOrder shipmentOrder, ShipmentStatus status, String location, String note) {
        ShipmentLog log = new ShipmentLog();
        log.setShipmentOrder(shipmentOrder);
        log.setStatus(status);
        log.setLocation(location);
        log.setNote(note);
        log.setMessage(note); // nếu muốn message giống note
        log.setTimestamp(java.time.LocalDateTime.now());

        shipmentLogRepository.save(log);
    }

    // ========== Tạo mới đơn vận chuyển ==========
    @Transactional
    public ShipmentOrder createShipmentOrder(ShipmentOrderRequestDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Order với id: " + dto.getOrderId()));

        Shipper shipper = dto.getShipperId() != null
                ? shipperRepository.findById(dto.getShipperId()).orElse(null)
                : null;

        Warehouse warehouse = dto.getWarehouseId() != null
                ? warehouseRepository.findById(dto.getWarehouseId()).orElse(null)
                : null;

        ShipmentOrder shipmentOrder = new ShipmentOrder();
        shipmentOrder.setOrder(order);
        shipmentOrder.setShipper(shipper);
        shipmentOrder.setWarehouse(warehouse);
        shipmentOrder.setPickupAddress(dto.getPickupAddress());
        shipmentOrder.setDeliveryAddress(dto.getDeliveryAddress());
        shipmentOrder.setCodAmount(dto.getCodAmount());
        shipmentOrder.setShippingFee(dto.getShippingFee());
        shipmentOrder.setStatus(dto.getStatus() != null ? dto.getStatus() : ShipmentStatus.PENDING);
        shipmentOrder.setEstimatedDelivery(dto.getEstimatedDelivery());
        int finalWeight = (dto.getWeight() != null && dto.getWeight() > 0) ? dto.getWeight() : 1000;
        shipmentOrder.setWeight(finalWeight);

        shipmentOrderRepository.save(shipmentOrder);
        //cập nhạt báo cáo
//        shipmentReportService.updateReportByShipment(shipmentOrder);

        // ================== TẠO CHẶNG VẬN CHUYỂN ĐẦU TIÊN ==================
        if (warehouse != null && shipper != null) {

            // --- LẤY ĐỊA CHỈ SHOP ---
            // Từ ShipmentOrder → Order → Shop → Address
            var shop = order.getShop();
            var shopAddress = shop != null ? shop.getAddress() : null;

            // --- TẠO THỜI GIAN ---
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime tomorrow = now.plusDays(1);

            SubShipmentOrder sub = new SubShipmentOrder();
            sub.setShipmentOrder(shipmentOrder);
            sub.setFromWarehouse(null); // Từ shop, KHÔNG dùng warehouse
            sub.setToWarehouse(warehouse);
            sub.setShipper(shipper);
            sub.setStatus(ShipmentStatus.PENDING);
            sub.setSequence(1);
            sub.setStartTime(now);
            sub.setEndTime(tomorrow);

            // Lưu sub shipment
            subShipmentOrderRepository.save(sub);
            // ================== SOCKET: THÔNG BÁO CHO SHIPPER ==================
            DeliveryMessage message = new DeliveryMessage(
                    "ASSIGNED",
                    sub.getId(),                       // subShipmentId (ĐÃ CÓ ID)
                    shipmentOrder.getId(),             // shipmentOrderId
                    shipper.getId(),                   // shipperId
                    sub.getStatus().name(),
                    "You have been assigned a new delivery task"
            );

            deliverySocketService.notifyShipper(
                    shipper.getId(),
                    message
            );

            // GHI LOG
            // Build địa chỉ shop dưới dạng text
            String shopFullAddress = shopAddress != null
                    ? shopAddress.getStreet() + ", "
                    + shopAddress.getCommune() + ", "
                    + shopAddress.getDistrict() + ", "
                    + shopAddress.getCity()
                    : "Không rõ";

// GHI LOG
            createShipmentLog(
                    shipmentOrder,
                    ShipmentStatus.PENDING,
                    "Tạo chặng 1: Shop (" + shopFullAddress + ") → " + warehouse.getName(),
                    "Khởi tạo chặng đầu tiên"
            );
        }

        return shipmentOrder;
    }

    // ========== Cập nhật trạng thái giao hàng ==========
    @Transactional
    public ShipmentOrderResponseDto updateStatus(UUID id, ShipmentStatus newStatus) {

        ShipmentOrder shipmentOrder = shipmentOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ShipmentOrder với id: " + id));

        shipmentOrder.setStatus(newStatus);

        if (newStatus == ShipmentStatus.DELIVERED) {
            shipmentOrder.setDeliveredAt(LocalDateTime.now());
        } else if (newStatus == ShipmentStatus.RETURNED) {
            shipmentOrder.setReturnedAt(LocalDateTime.now());
        }

        shipmentOrderRepository.save(shipmentOrder);

        // Ghi log
        createShipmentLog(shipmentOrder, newStatus,
                shipmentOrder.getWarehouse() != null ? shipmentOrder.getWarehouse().getName() : "",
                "Status updated to " + newStatus);

        // Nếu RETURNED thì cập nhật báo cáo (vì không liên quan COD)
        if (newStatus == ShipmentStatus.RETURNED) {
            shipmentReportService.updateReportByShipment(shipmentOrder);
        }

        return toResponseDto(shipmentOrder);
    }

    // ========== Lấy danh sách tất cả shipment orders ==========
    @Transactional(readOnly = true)
    public Map<String, Object> getAllWithFilters(int page, int size, ShipmentStatus status, String search, UUID shipperId, UUID warehouseId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ShipmentOrder> shipmentPage;

        // Gọi repository có filter tương ứng
        shipmentPage = shipmentOrderRepository.findWithFilters(status, search, shipperId, warehouseId, pageable);

        List<ShipmentOrderResponseDto> dtos = shipmentPage.getContent()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", dtos);
        response.put("currentPage", shipmentPage.getNumber());
        response.put("totalItems", shipmentPage.getTotalElements());
        response.put("totalPages", shipmentPage.getTotalPages());

        return response;
    }

    // ========== Lấy shipment theo ID ==========
    public ShipmentOrderResponseDto getById(UUID id) {
        ShipmentOrder entity = shipmentOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ShipmentOrder với id: " + id));

        ShipmentOrderResponseDto dto = toResponseDto(entity);

        dto.setSubShipments(subShipmentOrderRepository.findByShipmentOrder_Id(id)
                .stream()
                .map(sub -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", sub.getId());
                    map.put("fromWarehouse", sub.getFromWarehouse() != null ? sub.getFromWarehouse().getName() : "Shop");
                    map.put("toWarehouse", sub.getToWarehouse() != null ? sub.getToWarehouse().getName() : "Khách");
                    map.put("shipper", sub.getShipper() != null && sub.getShipper().getUser() != null && sub.getShipper().getUser().getProfile() != null 
                        ? sub.getShipper().getUser().getProfile().getFullName() : null);
                    map.put("status", sub.getStatus());
                    map.put("sequence", sub.getSequence());
                    return map;
                })
                .collect(Collectors.toList()));

        return dto;
    }


    // ========== Xóa shipment order ==========
    public void delete(UUID id) {
        if (!shipmentOrderRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy ShipmentOrder với id: " + id);
        }
        shipmentOrderRepository.deleteById(id);
    }
    public ShipmentOrder getEntityById(UUID id) {
        return shipmentOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ShipmentOrder với id: " + id));
    }

    public ShipmentOrderResponseDto assignShipper(UUID shipmentOrderId, UUID shipperId) {
        ShipmentOrder shipmentOrder = shipmentOrderRepository.findById(shipmentOrderId)
                .orElseThrow(() -> new RuntimeException("Shipment order not found"));

        Shipper shipper = shipperRepository.findById(shipperId)
                .orElseThrow(() -> new RuntimeException("Shipper not found"));

        // Nếu shipper đang bận, bạn có thể kiểm tra trước khi assign
        if (shipper.getStatus() == ShipperStatus.INACTIVE) {
            throw new RuntimeException("Shipper is INACTIVE");
        }

        shipmentOrder.setShipper(shipper);
        shipmentOrder.setStatus(ShipmentStatus.PICKING_UP); // Cập nhật trạng thái

        ShipmentOrder saved = shipmentOrderRepository.save(shipmentOrder);

        createShipmentLog(saved, ShipmentStatus.PICKING_UP, shipmentOrder.getPickupAddress(),
                "Shipper " + (shipper.getUser() != null && shipper.getUser().getProfile() != null 
                    ? shipper.getUser().getProfile().getFullName() : "Unknown") + " assigned to pick up");

        // Cập nhật trạng thái shipper nếu cần
//        shipper.setStatus(ShipperStatus.BUSY);
        shipperRepository.save(shipper);

        return toResponseDto(saved);
    }
    public ShipmentOrderResponseDto unassignShipper(UUID shipmentOrderId) {
        ShipmentOrder shipmentOrder = shipmentOrderRepository.findById(shipmentOrderId)
                .orElseThrow(() -> new RuntimeException("Shipment order not found"));

//        Shipper shipper = shipmentOrder.getShipper();
//        if (shipper != null) {
//            shipper.setStatus(ShipperStatus.ACTIVE);
//            shipperRepository.save(shipper);
//        }

        shipmentOrder.setShipper(null);
        shipmentOrder.setStatus(ShipmentStatus.PENDING);

        ShipmentOrder saved = shipmentOrderRepository.save(shipmentOrder);
        createShipmentLog(saved, ShipmentStatus.PENDING, shipmentOrder.getPickupAddress(),
                "Shipper unassigned");
        return toResponseDto(saved);
    }
    // ================== Kiểm tra order đã có shipment hay chưa ==================
    @Transactional(readOnly = true)
    public boolean checkOrderHasShipment(UUID orderId) {
        return shipmentOrderRepository.existsByOrder_Id(orderId);
    }

    // ================== Lấy shipment theo Order ID ==================
    @Transactional(readOnly = true)
    public ShipmentOrderResponseDto getByOrderId(UUID orderId) {
        ShipmentOrder shipmentOrder = shipmentOrderRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ShipmentOrder cho Order ID: " + orderId));
        return toResponseDto(shipmentOrder);
    }


    public List<ShipmentOrder> getDeliveredOrdersOfShipperByDate(
            UUID shipperId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        return shipmentOrderRepository.findDeliveredByShipperAndDate(
                shipperId,
                ShipmentStatus.DELIVERED,
                start,
                end
        );
    }

    public List<ShipmentOrderResponseDto> getAllOrdersOfShipper(UUID shipperId) {
        return shipmentOrderRepository.findByShipper_Id(shipperId)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public Map<String, Object> getDashboardStatistics(LocalDateTime start, LocalDateTime end) {

        List<ShipmentOrder> orders = shipmentOrderRepository.findDeliveredOrdersBetween(
                ShipmentStatus.DELIVERED,
                start,
                end
        );

        long activeShippers = orders.stream()
                .map(o -> o.getShipper().getId())
                .distinct()
                .count();

        BigDecimal totalCod = orders.stream()
                .map(ShipmentOrder::getCodAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalDeliveredOrders", orders.size(),
                "activeShippers", activeShippers,
                "totalCod", totalCod,
                "orders", orders.stream().map(this::toResponseDto).toList()
        );
    }
    public Map<String, Object> getShipmentsByCompany(UUID companyId, int page, int size, ShipmentStatus status, String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<ShipmentOrder> shipmentPage = shipmentOrderRepository
                .findVisibleShipmentsForCompany(companyId, status, search, pageable);

        return Map.of(
                "data", shipmentPage.getContent().stream().map(this::toResponseDto).toList(),
                "currentPage", shipmentPage.getNumber(),
                "totalItems", shipmentPage.getTotalElements(),
                "totalPages", shipmentPage.getTotalPages()
        );
    }

}
