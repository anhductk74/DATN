    package com.example.smart_mall_spring.Services.Logistics;


    import com.example.smart_mall_spring.Dtos.Logistic.ShipmentLog.ShipmentLogRequestDto;
    import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderDetailResponseDto;
    import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderRequestDto;
    import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderResponseDto;
    import com.example.smart_mall_spring.Dtos.Logistic.SubShipmentOrder.SubShipmentOrderUpdateDto;
    import com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog.OrderTrackingLogRequest;
    import com.example.smart_mall_spring.Dtos.WebSocket.DeliveryMessage;
    import com.example.smart_mall_spring.Entities.Address;
    import com.example.smart_mall_spring.Entities.Logistics.*;
    import com.example.smart_mall_spring.Entities.Orders.Order;
    import com.example.smart_mall_spring.Entities.Orders.OrderStatusHistory;
    import com.example.smart_mall_spring.Entities.Products.ProductVariant;
    import com.example.smart_mall_spring.Enum.ShipmentStatus;
    import com.example.smart_mall_spring.Enum.StatusOrder;
    import com.example.smart_mall_spring.Repositories.Logistics.*;
    import com.example.smart_mall_spring.Repositories.OrderRepository;
    import com.example.smart_mall_spring.Repositories.OrderStatusHistoryRepository;
    import com.example.smart_mall_spring.Services.DeliverySocketService;
    import com.example.smart_mall_spring.Services.Order.OrderTrackingLogService;
    import jakarta.persistence.EntityNotFoundException;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.java.Log;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.time.LocalDateTime;
    import java.util.Comparator;
    import java.util.List;
    import java.util.UUID;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class SubShipmentOrderService {

        private final SubShipmentOrderRepository subShipmentOrderRepository;
        private final ShipmentOrderRepository shipmentOrderRepository;
       private final ShipperTransactionService shipperTransactionService;
        private final WarehouseRepository warehouseRepository;
        private final ShipperRepository shipperRepository;
        private final OrderRepository orderRepository;
        private final OrderStatusHistoryRepository orderStatusHistoryRepository;
        private final WarehouseInventoryService warehouseInventoryService;
        private final ShipmentReportService shipmentReportService;
        private final ShipmentLogService shipmentLogService;
        private final OrderTrackingLogService  orderTrackingLogService;
        private final DeliverySocketService  deliverySocketService;
        private final ShipmentLogRepository  shipmentLogRepository;

        private SubShipmentOrderResponseDto toResponseDto(SubShipmentOrder entity) {
            return SubShipmentOrderResponseDto.builder()
                    .id(entity.getId())
                    .shipmentOrderId(entity.getShipmentOrder().getId())
                    .shipmentOrderCode(entity.getShipmentOrder().getOrder() != null
                            ? entity.getShipmentOrder().getOrder().getId().toString()
                            : null)
                    .fromWarehouseId(entity.getFromWarehouse() != null ? entity.getFromWarehouse().getId() : null)
                    .fromWarehouseName(entity.getFromWarehouse() != null ? entity.getFromWarehouse().getName() : null)
                    .toWarehouseId(entity.getToWarehouse() != null ? entity.getToWarehouse().getId() : null)
                    .toWarehouseName(entity.getToWarehouse() != null ? entity.getToWarehouse().getName() : null)
                    .shipperId(entity.getShipper() != null ? entity.getShipper().getId() : null)
                    .shipperName(entity.getShipper() != null && entity.getShipper().getUser() != null && entity.getShipper().getUser().getProfile() != null
                        ? entity.getShipper().getUser().getProfile().getFullName() : null)
                    .status(entity.getStatus())
                    .sequence(entity.getSequence())
                    .startTime(entity.getStartTime())
                    .endTime(entity.getEndTime())
                    .updateTime(entity.getUpdatedAt())
                    .build();
        }

        private SubShipmentOrder toEntity(SubShipmentOrderRequestDto dto) {
            ShipmentOrder shipmentOrder = shipmentOrderRepository.findById(dto.getShipmentOrderId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ShipmentOrder"));

            Warehouse fromWarehouse = null;
            if (dto.getFromWarehouseId() != null) {
                fromWarehouse = warehouseRepository.findById(dto.getFromWarehouseId())
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kho đi"));
            }

            Warehouse toWarehouse = null;
            if (dto.getToWarehouseId() != null) {
                toWarehouse = warehouseRepository.findById(dto.getToWarehouseId())
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy kho đến"));
            }

            Shipper shipper = null;
            if (dto.getShipperId() != null) {
                shipper = shipperRepository.findById(dto.getShipperId())
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shipper"));
            }

            SubShipmentOrder sub = new SubShipmentOrder();
            sub.setShipmentOrder(shipmentOrder);
            sub.setFromWarehouse(fromWarehouse);
            sub.setToWarehouse(toWarehouse);
            sub.setShipper(shipper);
            sub.setStatus(dto.getStatus() != null ? dto.getStatus() : ShipmentStatus.PENDING);
            sub.setSequence(dto.getSequence());
            sub.setStartTime(dto.getStartTime());
            sub.setEndTime(dto.getEndTime());

            return sub;
        }

        public List<SubShipmentOrderResponseDto> getAll() {
            return subShipmentOrderRepository.findAll()
                    .stream().map(this::toResponseDto).collect(Collectors.toList());
        }

        public List<SubShipmentOrderResponseDto> getByShipmentOrder(UUID shipmentOrderId) {
            return subShipmentOrderRepository.findByShipmentOrder_Id(shipmentOrderId)
                    .stream().map(this::toResponseDto).collect(Collectors.toList());
        }

        public SubShipmentOrderResponseDto getById(UUID id) {
            SubShipmentOrder entity = subShipmentOrderRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy SubShipmentOrder"));
            return toResponseDto(entity);
        }
        public List<SubShipmentOrderDetailResponseDto> getDetailByShipper(UUID shipperId) {
            return subShipmentOrderRepository.findByShipper_Id(shipperId)
                    .stream()
                    .map(this::toDetailResponseDto)
                    .collect(Collectors.toList());
        }
        public List<SubShipmentOrderResponseDto> getHistory(UUID shipperId) {
            return subShipmentOrderRepository.findByShipper_IdAndStatus(shipperId, ShipmentStatus.DELIVERED)
                    .stream()
                    .map(this::toResponseDto)
                    .collect(Collectors.toList());
        }
        public SubShipmentOrderResponseDto findByTrackingCode(String code) {
            SubShipmentOrder sub = getCurrentSubByTrackingCode(code);
            return toResponseDto(sub);
        }

        public SubShipmentOrderResponseDto confirmPickupByCode(String code) {

            SubShipmentOrder sub = getCurrentSubByTrackingCode(code);

            if (sub.getStatus() != ShipmentStatus.PENDING) {
                throw new IllegalStateException("Đơn không ở trạng thái cho phép nhận");
            }

            sub = updateSubStatus(
                    sub,
                    ShipmentStatus.PICKING_UP,
                    "Shipper nhận hàng",
                    "Shipper đã đến điểm lấy hàng"
            );

            return toResponseDto(sub);
        }


        public SubShipmentOrderResponseDto confirmDeliveryByCode(String code) {

            SubShipmentOrder sub = getCurrentSubByTrackingCode(code);

            if (sub.getStatus() != ShipmentStatus.IN_TRANSIT &&
                    sub.getStatus() != ShipmentStatus.PICKING_UP) {
                throw new IllegalStateException("Đơn không đủ điều kiện hoàn thành chặng");
            }

            sub = updateSubStatus(
                    sub,
                    ShipmentStatus.DELIVERED,
                    "Hoàn thành chặng",
                    "Hàng đã được giao đến điểm nhận"
            );

            return toResponseDto(sub);
        }



        public SubShipmentOrderResponseDto confirmTransitByCode(String code) {

            SubShipmentOrder sub = getCurrentSubByTrackingCode(code);

            if (sub.getStatus() != ShipmentStatus.PICKING_UP) {
                throw new IllegalStateException("Đơn chưa được pickup");
            }

            sub = updateSubStatus(
                    sub,
                    ShipmentStatus.IN_TRANSIT,
                    "Đang vận chuyển",
                    "Hàng đã rời điểm lấy và đang vận chuyển"
            );

            return toResponseDto(sub);
        }

        private SubShipmentOrder updateSubStatus(
                SubShipmentOrder sub,
                ShipmentStatus newStatus,
                String actionTitle,
                String description
        ) {
            ShipmentStatus oldStatus = sub.getStatus();

            sub.setStatus(newStatus);

            if (newStatus == ShipmentStatus.PICKING_UP) {
                sub.setStartTime(LocalDateTime.now());
            }

            if (newStatus == ShipmentStatus.DELIVERED) {
                sub.setEndTime(LocalDateTime.now());
            }

            sub = subShipmentOrderRepository.save(sub);

            //  LOG
            createShipmentLog(
                    sub.getShipmentOrder(),
                    newStatus,
                    actionTitle,
                    description
            );

            //  SOCKET
            notifySubShipmentStatusChange(sub, oldStatus);

            return sub;
        }

        private void notifySubShipmentStatusChange(SubShipmentOrder sub,
                                                   ShipmentStatus oldStatus) {

            if (oldStatus == sub.getStatus()) return;

            DeliveryMessage message = new DeliveryMessage(
                    "SUB_STATUS_UPDATE",
                    sub.getShipmentOrder().getId(),   // shipmentOrderId
                    sub.getId(),                      // subShipmentId
                    sub.getShipper() != null
                            ? sub.getShipper().getId()
                            : null,
                    sub.getStatus().name(),
                    "Sub-shipment status updated"
            );

            // 🔔 Manager luôn nhận
            deliverySocketService.notifyManager(message);

            // 🔔 Shipper nhận (nếu có)
            if (sub.getShipper() != null) {
                deliverySocketService.notifyShipper(
                        sub.getShipper().getId(),
                        message
                );
            }
        }


        private SubShipmentOrder getCurrentSubByTrackingCode(String code) {

            List<SubShipmentOrder> subs =
                    subShipmentOrderRepository.findAllByTrackingCodeSuffix(code);

            if (subs.isEmpty()) {
                throw new EntityNotFoundException("Không tìm thấy đơn với mã: " + code);
            }

            // Ưu tiên chặng đang xử lý
            return subs.stream()
                    .filter(s ->
                            s.getStatus() == ShipmentStatus.PICKING_UP ||
                                    s.getStatus() == ShipmentStatus.IN_TRANSIT
                    )
                    .findFirst()
                    // fallback: lấy chặng chưa giao
                    .orElseGet(() ->
                            subs.stream()
                                    .filter(s -> s.getStatus() != ShipmentStatus.DELIVERED)
                                    .findFirst()
                                    .orElseThrow(() ->
                                            new IllegalStateException("Đơn đã hoàn thành tất cả chặng"))
                    );
        }



        @Transactional
        public SubShipmentOrderResponseDto create(SubShipmentOrderRequestDto dto) {

            //  Map DTO → Entity
            SubShipmentOrder sub = toEntity(dto);

            //  Validate nghiệp vụ cơ bản
            if (sub.getShipmentOrder() == null) {
                throw new IllegalArgumentException("ShipmentOrder is required");
            }

            //  int → chỉ check giá trị
            if (sub.getSequence() <= 0) {
                throw new IllegalArgumentException("Sequence must be greater than 0");
            }

            // (OPTIONAL) auto set status nếu chưa có
            if (sub.getStatus() == null) {
                sub.setStatus(ShipmentStatus.PENDING);
            }

            // (OPTIONAL) auto set start time
            if (sub.getStartTime() == null) {
                sub.setStartTime(LocalDateTime.now());
            }

            //  Save
            SubShipmentOrder saved = subShipmentOrderRepository.save(sub);

            if (saved.getShipper() != null) {

                ShipmentOrder shipmentOrder = saved.getShipmentOrder();

                shipmentOrder.setShipper(saved.getShipper());   // shipper hiện tại

                shipmentOrderRepository.save(shipmentOrder);
            }

            //  GHI LOG
            String from = saved.getFromWarehouse() != null
                    ? saved.getFromWarehouse().getName()
                    : "Shop";

            String to = saved.getToWarehouse() != null
                    ? saved.getToWarehouse().getName()
                    : "Khách hàng";

            createShipmentLog(
                    saved.getShipmentOrder(),
                    saved.getStatus(),
                    "Tạo chặng " + saved.getSequence() + ": " + from + " → " + to,
                    "Khởi tạo chặng vận chuyển"
            );

            //  SOCKET → thông báo shipper (nếu có)
            if (saved.getShipper() != null) {

                DeliveryMessage message = new DeliveryMessage(
                        "ASSIGNED",
                        saved.getId(),                   // subShipmentId
                        saved.getShipmentOrder().getId(), // shipmentOrderId
                        saved.getShipper().getId(),       // shipperId
                        saved.getStatus().name(),
                        "You have been assigned a new delivery task"
                );

                deliverySocketService.notifyShipper(
                        saved.getShipper().getId(),
                        message
                );
            }

            //  Return DTO
            return toResponseDto(saved);
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

        public SubShipmentOrderResponseDto update(UUID id, SubShipmentOrderUpdateDto dto) {

            SubShipmentOrder sub = subShipmentOrderRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy SubShipmentOrder"));

            ShipmentStatus oldStatus = sub.getStatus();

            if (dto.getStatus() != null) sub.setStatus(dto.getStatus());
            if (dto.getStartTime() != null) sub.setStartTime(dto.getStartTime());
            if (dto.getEndTime() != null) sub.setEndTime(dto.getEndTime());

            subShipmentOrderRepository.save(sub);

            // --- Ghi log SubShipment ---
            shipmentLogService.createLog(
                    ShipmentLogRequestDto.builder()
                            .shipmentOrderId(sub.getShipmentOrder().getId())
                            .subShipmentOrderId(sub.getId())
                            .status(sub.getStatus())
                            .location(sub.getToWarehouse() != null ? sub.getToWarehouse().getName() : "Khách")
                            .note("Cập nhật trạng thái vận chuyển đơn hàng")
                            .build()
            );

            // --- Ghi log cho user (OrderTrackingLog) ---
            if (sub.getShipmentOrder().getOrder() != null) {
                orderTrackingLogService.recordTrackingLog(
                        sub.getShipmentOrder().getOrder(),
                        OrderTrackingLogRequest.builder()
                                .carrier(sub.getShipper() != null && sub.getShipper().getUser() != null && sub.getShipper().getUser().getProfile() != null
                                    ? sub.getShipper().getUser().getProfile().getFullName() : "Giao hàng tiết kiệm")
                                .trackingNumber(sub.getShipmentOrder().getTrackingCode() != null
                                        ? sub.getShipmentOrder().getTrackingCode()
                                        : "")
                                .currentLocation(sub.getToWarehouse() != null ? sub.getToWarehouse().getName() : "Khách")
                                .statusDescription(getTrackingDescription(sub))
                                .build()
                );
            }


            // Xử lý inventory
            if (oldStatus != ShipmentStatus.DELIVERED && sub.getStatus() == ShipmentStatus.DELIVERED) {
                handleInventoryWhenDelivered(sub);
            }

            //  CẬP NHẬT STATUS CHO ShipmentOrder
            updateParentShipmentStatus(sub.getShipmentOrder());

            //  CẬP NHẬT BÁO CÁO
            shipmentReportService.updateReportByShipment(sub.getShipmentOrder());

            List<SubShipmentOrder> subs = subShipmentOrderRepository.findByShipmentOrder_Id(sub.getShipmentOrder().getId());

            SubShipmentOrder lastSub = subs.stream()
                    .max(Comparator.comparingInt(SubShipmentOrder::getSequence))
                    .orElse(null);

            if (lastSub != null && lastSub.getId().equals(sub.getId())
                    && sub.getStatus() == ShipmentStatus.DELIVERED) {

                shipperTransactionService.createTransactionForDeliveredShipment(sub.getShipmentOrder());
                shipperTransactionService.createBonusForDeliveredShipment(sub.getShipmentOrder());
            }
            // 🔔 ===== REAL-TIME WEBSOCKET =====
            if (dto.getStatus() != null && oldStatus != sub.getStatus()) {

                DeliveryMessage message = new DeliveryMessage(
                        "STATUS_UPDATE",
                        sub.getId(),                         // subShipmentId
                        sub.getShipmentOrder().getId(),       // shipmentOrderId
                        sub.getShipper() != null
                                ? sub.getShipper().getId()
                                : null,
                        sub.getStatus().name(),
                        "Sub-shipment status updated"
                );

                // ➜ Manager Web
                deliverySocketService.notifyManager(message);

                // ➜ Shipper App (nếu có)
                if (sub.getShipper() != null) {
                    deliverySocketService.notifyShipper(
                            sub.getShipper().getId(),
                            message
                    );
                }
            }

            return toResponseDto(sub);
        }

        public void delete(UUID id) {
            SubShipmentOrder sub = subShipmentOrderRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy SubShipmentOrder"));
            subShipmentOrderRepository.delete(sub);
        }
        private void updateParentShipmentStatus(ShipmentOrder shipmentOrder) {
            ShipmentStatus oldStatus = shipmentOrder.getStatus();

            List<SubShipmentOrder> subs = subShipmentOrderRepository
                    .findByShipmentOrder_Id(shipmentOrder.getId());

            // Tìm 3 sub theo thứ tự chặng
            SubShipmentOrder sub1 = subs.stream().filter(s -> s.getSequence() == 1).findFirst().orElse(null);
            SubShipmentOrder sub2 = subs.stream().filter(s -> s.getSequence() == 2).findFirst().orElse(null);
            SubShipmentOrder sub3 = subs.stream().filter(s -> s.getSequence() == 3).findFirst().orElse(null);

            // ---------------------------
            // ⚠️ 1. Kiểm tra Sub 3 trước (được ưu tiên nhất)
            // ---------------------------
            if (sub3 != null) {

                ShipmentStatus s3 = sub3.getStatus();

                if (s3 == ShipmentStatus.CANCELLED) {
                    shipmentOrder.setStatus(ShipmentStatus.CANCELLED);

                }
                else if (s3 == ShipmentStatus.RETURNING) {
                    shipmentOrder.setStatus(ShipmentStatus.RETURNING);
                }
                else if (s3 == ShipmentStatus.RETURNED) {
                    shipmentOrder.setStatus(ShipmentStatus.RETURNED);
                    shipmentOrder.setReturnedAt(LocalDateTime.now());
                }
                else if (s3 == ShipmentStatus.DELIVERED) {
                    shipmentOrder.setStatus(ShipmentStatus.DELIVERED);
                    shipmentOrder.setShipper(sub3.getShipper());
                    shipmentOrder.setDeliveredAt(LocalDateTime.now());
                    //  AUTO UPDATE ORDER STATUS
                    updateOrderStatusFromShipment(shipmentOrder);
                }
                // Nếu chưa giao thì check tiếp sub2, sub1
                else {
                    // sẽ xét tiếp bên dưới
                }
            }

            // ---------------------------
            // ⚠️ 2. Nếu sub3 chưa DELIVERED → kiểm tra Sub 2
            // ---------------------------
            if (sub3 == null || sub3.getStatus() != ShipmentStatus.DELIVERED) {
                if (sub2 != null && sub2.getStatus() == ShipmentStatus.DELIVERED) {
                    shipmentOrder.setStatus(ShipmentStatus.IN_TRANSIT);
                    shipmentOrder.setWarehouse(sub2.getToWarehouse());
                }
            }

            // ---------------------------
            // ⚠️ 3. Nếu sub 2 cũng chưa DELIVERED → kiểm tra Sub 1
            // ---------------------------
            if ((sub2 == null || sub2.getStatus() != ShipmentStatus.DELIVERED)
                    && (sub3 == null || sub3.getStatus() != ShipmentStatus.DELIVERED)) {
                if (sub1 != null && sub1.getStatus() == ShipmentStatus.DELIVERED) {
                    shipmentOrder.setStatus(ShipmentStatus.PICKING_UP);
    //                shipmentOrder.setWarehouse(sub1.getToWarehouse());
                }
            }

            // ---------------------------
            // ⚠️ 4. Nếu tất cả đều pending thì giữ nguyên hoặc về PENDING
            // ---------------------------
            if (sub1 != null && sub1.getStatus() == ShipmentStatus.PENDING &&
                    sub2 != null && sub2.getStatus() == ShipmentStatus.PENDING &&
                    sub3 != null && sub3.getStatus() == ShipmentStatus.PENDING) {

                shipmentOrder.setStatus(ShipmentStatus.PENDING);
            }

            shipmentOrderRepository.save(shipmentOrder);
            // ===== 🔔 REAL-TIME CHO MANAGER =====
            if (oldStatus != shipmentOrder.getStatus()) {

                DeliveryMessage message = new DeliveryMessage(
                        "SHIPMENT_STATUS_UPDATE",
                        shipmentOrder.getId(),    // shipmentOrderId
                        null,                     // subShipmentId (không cần)
                        shipmentOrder.getShipper() != null
                                ? shipmentOrder.getShipper().getId()
                                : null,
                        shipmentOrder.getStatus().name(),
                        "Shipment order status updated"
                );

                deliverySocketService.notifyManager(message);
            }
        }

        private void updateOrderStatusFromShipment(ShipmentOrder shipmentOrder) {

            Order order = shipmentOrder.getOrder();
            if (order == null) return;

            StatusOrder newStatus = StatusOrder.DELIVERED;

            if (order.getStatus() != newStatus) {

                StatusOrder oldStatus = order.getStatus();

                order.setStatus(newStatus);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);

                OrderStatusHistory history = new OrderStatusHistory();
                history.setOrder(order);
                history.setFromStatus(oldStatus);
                history.setToStatus(newStatus);
                history.setNote("Đơn hàng đã được giao thông công sau chặn cuối");
                history.setChangedAt(LocalDateTime.now());

                orderStatusHistoryRepository.save(history);
            }
        }
        private void handleInventoryWhenDelivered(SubShipmentOrder sub) {

            Order order = sub.getShipmentOrder().getOrder();

            if (order.getItems() == null || order.getItems().isEmpty()) {
                throw new IllegalStateException("Order không có sản phẩm nào");
            }

            ProductVariant variant = order.getItems().get(0).getVariant();

            if (variant == null || variant.getProduct() == null) {
                throw new IllegalStateException("OrderItem không có Product hợp lệ");
            }

            UUID productId = variant.getProduct().getId();

            // ----------------------------
            // Chặng 1: Shop → Kho 1
            // ----------------------------
            if (sub.getSequence() == 1) {

                if (sub.getToWarehouse() != null) {
                    warehouseInventoryService.addInventoryItem(
                            sub.getToWarehouse().getId(),
                            productId,
                            1,
                            "package",
                            "AUTO"
                    );
                }
            }

            // ----------------------------
            // Chặng 2: Kho 1 → Kho 2
            // ----------------------------
            else if (sub.getSequence() == 2) {

                // Xóa khỏi kho đi
                if (sub.getFromWarehouse() != null) {
                    warehouseInventoryService.deleteByProductAndWarehouse(
                            productId,
                            sub.getFromWarehouse().getId()
                    );
                }

                // Thêm vào kho đến
                if (sub.getToWarehouse() != null) {
                    warehouseInventoryService.addInventoryItem(
                            sub.getToWarehouse().getId(),
                            productId,
                            1,
                            "backage",
                            "AUTO"
                    );
                }
            }

            // ----------------------------
            // Chặng 3: Kho → Khách hàng
            // ----------------------------
            else if (sub.getSequence() == 3) {

                if (sub.getFromWarehouse() != null) {
                    warehouseInventoryService.deleteByProductAndWarehouse(
                            productId,
                            sub.getFromWarehouse().getId()
                    );
                }
            }
        }
        private String getTrackingDescription(SubShipmentOrder sub) {
            ShipmentStatus status = sub.getStatus();
            int sequence = sub.getSequence();
            String fromWarehouse = sub.getFromWarehouse() != null ? sub.getFromWarehouse().getName() : "";
            String toWarehouse = sub.getToWarehouse() != null ? sub.getToWarehouse().getName() : "";

            switch (sequence) {
                case 1: // Sub 1: Shop -> Kho 1
                    if (status == ShipmentStatus.PICKING_UP)
                        return "Shipper đang đi lấy hàng tại shop";
                    if (status == ShipmentStatus.DELIVERED)
                        return "Đơn hàng đã đến kho: " + toWarehouse;
                    break;
                case 2: // Sub 2: Kho 1 -> Kho 2
                    if (status == ShipmentStatus.IN_TRANSIT)
                        return "Đơn hàng đang vận chuyển từ kho: " + fromWarehouse + " đến kho: " + toWarehouse;
                    if (status == ShipmentStatus.DELIVERED)
                        return "Đơn hàng đã đến kho: " + toWarehouse;
                    break;
                case 3: // Sub 3: Kho -> Khách
                    if (status == ShipmentStatus.IN_TRANSIT)
                        return "Đơn hàng đang giao từ kho: " + fromWarehouse + " đến khách hàng";
                    if (status == ShipmentStatus.DELIVERED)
                        return "Đơn hàng đã giao thành công đến khách hàng";
                    break;
                default:
                    return status.name();
            }

            return status.name();
        }
        private SubShipmentOrderDetailResponseDto toDetailResponseDto(SubShipmentOrder entity) {

            Order order = entity.getShipmentOrder().getOrder();

            String shopName = null;
            Address shopAddress = null;
            String shopPhone = null;

            String customerName = null;
            Address customerAddress = null;
            String customerPhone = null;

            if (order != null) {

                // --- Người gửi (Shop) ---
                if (order.getShop() != null) {
                    shopName = order.getShop().getName();
                   shopAddress = order.getShop().getAddress();
                    shopPhone = order.getShop().getPhoneNumber();
                }

                // --- Người nhận (Customer) ---
                if (order.getUser() != null) {
                    customerName = order.getUser().getProfile().getFullName();
                    customerAddress = order.getShippingAddress().getAddress();
                    customerPhone = order.getUser().getProfile().getPhoneNumber();
                }
            }

            return SubShipmentOrderDetailResponseDto.builder()
                    .id(entity.getId())
                    .shipmentOrderId(entity.getShipmentOrder().getId())
                    .shipmentOrderCode(entity.getShipmentOrder().getTrackingCode())

                    .fromWarehouseId(entity.getFromWarehouse() != null ? entity.getFromWarehouse().getId() : null)
                    .fromWarehouseName(entity.getFromWarehouse() != null ? entity.getFromWarehouse().getName() : null)

                    .toWarehouseId(entity.getToWarehouse() != null ? entity.getToWarehouse().getId() : null)
                    .toWarehouseName(entity.getToWarehouse() != null ? entity.getToWarehouse().getName() : null)

                    .shipperId(entity.getShipper() != null ? entity.getShipper().getId() : null)
                    .shipperName(entity.getShipper() != null ? entity.getShipper().getUser().getProfile().getFullName() : null)

                    .status(entity.getStatus())
                    .sequence(entity.getSequence())
                    .startTime(entity.getStartTime())
                    .endTime(entity.getEndTime())

                    .shopName(shopName)
                    .shopAddress(shopAddress)
                    .shopPhone(shopPhone)

                    .customerName(customerName)
                    .customerAddress(customerAddress)
                    .customerPhone(customerPhone)
                    .updateTime(entity.getUpdatedAt())

                    .build();
        }
    }
