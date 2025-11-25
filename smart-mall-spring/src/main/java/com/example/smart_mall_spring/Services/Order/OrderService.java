package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Dtos.Address.AddressResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.*;
import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderItem.OrderItemResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderTrackingLog.OrderTrackingLogRequest;
import com.example.smart_mall_spring.Dtos.Orders.OrderVoucher.OrderVoucherResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.Payment.PaymentResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.ShippingFee.ShippingFeeResponseDto;
import com.example.smart_mall_spring.Entities.Orders.*;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserAddress;
import com.example.smart_mall_spring.Enum.*;
import com.example.smart_mall_spring.Repositories.*;
import com.example.smart_mall_spring.Services.Wallet.WalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ShippingFeeRepository shippingFeeRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderVoucherRepository orderVoucherRepository;
    private final VoucherRepository voucherRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final WalletService walletService;
    private final OrderTrackingLogService orderTrackingLogService;

    /**
     * 🛒 Tạo đơn hàng mới
     */
    @Transactional
    public OrderResponseDto createOrder(OrderRequestDto dto) {
        // 1️ Kiểm tra dữ liệu đầu vào
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findById(dto.getShopId())
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        UserAddress address = userAddressRepository.findById(dto.getShippingAddressId())
                .orElseThrow(() -> new RuntimeException("Shipping address not found"));

        // 2️ Khởi tạo Order
        Order order = new Order();
        order.setUser(user);
        order.setShop(shop);
        order.setShippingAddress(address);
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setStatus(StatusOrder.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>()); //  tránh null khi map lại
        orderRepository.save(order);

        double subtotal = 0.0;

        // 3️ Lưu danh sách sản phẩm (OrderItems)
        for (OrderItemRequestDto itemDto : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDto.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Product variant not found"));

            double price = variant.getPrice();
            double itemSubtotal = price * itemDto.getQuantity();

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setVariant(variant);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(price);
            item.setSubtotal(itemSubtotal);

            orderItemRepository.save(item);
            order.getItems().add(item); //  đảm bảo order có items trong bộ nhớ
            subtotal += itemSubtotal;
        }

        // 4️ Tạo ShippingFee
        double shippingFeeAmount = dto.getShippingFee() != null ? dto.getShippingFee() : 30000.0;
        ShippingFee shippingFee = new ShippingFee();
        shippingFee.setOrder(order);
        shippingFee.setFeeAmount(shippingFeeAmount);
        shippingFee.setShippingMethod("STANDARD");
        shippingFee.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(3));
        shippingFeeRepository.save(shippingFee);

        order.setShippingFees(new ArrayList<>());
        order.getShippingFees().add(shippingFee);

        // 5. Áp dụng voucher (KHÔNG save lại order giữa chừng)
        double totalDiscount = 0.0;
        List<OrderVoucherResponseDto> appliedVouchers = new ArrayList<>();
        List<OrderVoucher> orderVouchers = new ArrayList<>();

        if (dto.getVoucherIds() != null && !dto.getVoucherIds().isEmpty()) {
            // Dùng Set để loại trùng nếu client gửi trùng ID
            Set<UUID> uniqueVoucherIds = new HashSet<>(dto.getVoucherIds());

            for (UUID voucherId : uniqueVoucherIds) {
                Voucher voucher = voucherRepository.findById(voucherId)
                        .orElseThrow(() -> new RuntimeException("Voucher not found"));

                double discountAmount = 0.0;
                if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
                    discountAmount = subtotal * (voucher.getDiscountValue() / 100);
                    if (voucher.getMaxDiscountAmount() != null) {
                        discountAmount = Math.min(discountAmount, voucher.getMaxDiscountAmount());
                    }
                } else if (voucher.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                    discountAmount = voucher.getDiscountValue();
                }

                if (voucher.getMinOrderValue() != null && subtotal < voucher.getMinOrderValue()) {
                    discountAmount = 0.0;
                }

                totalDiscount += discountAmount;

                OrderVoucher orderVoucher = new OrderVoucher();
                orderVoucher.setOrder(order);
                orderVoucher.setVoucher(voucher);
                orderVoucher.setDiscountAmount(discountAmount);
                orderVoucherRepository.save(orderVoucher);
                orderVouchers.add(orderVoucher);

                appliedVouchers.add(OrderVoucherResponseDto.builder()
                        .voucherId(voucher.getId())
                        .voucherCode(voucher.getCode())
                        .description(voucher.getDescription())
                        .discountAmount(discountAmount)
                        .build());
            }
        }
        order.setVouchers(orderVouchers);

        // 6️ Thanh toán
        double finalAmount = subtotal + shippingFeeAmount - totalDiscount;
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(dto.getPaymentMethod());
        payment.setAmount(finalAmount);
        payment.setPaidAt(LocalDateTime.now());
        payment.setStatus(PaymentStatus.PENDING); // Trạng thái chờ thanh toán
        payment.setTransactionId(UUID.randomUUID().toString()); // sinh tạm transactionId
        paymentRepository.save(payment);
        order.setPayment(payment);
        // gán các giá trị tiền ệ
        order.setTotalAmount(subtotal);
        order.setDiscountAmount(totalDiscount);
        order.setShippingFee(shippingFeeAmount);
        order.setFinalAmount(finalAmount);
        orderRepository.save(order);
        // 7️ Lưu lịch sử trạng thái đơn hàng
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(null);
        history.setToStatus(StatusOrder.PENDING);
        history.setChangedAt(LocalDateTime.now());
        history.setNote("Order created successfully");
        orderStatusHistoryRepository.save(history);
        orderRepository.save(order);
        
        // Thêm số tiền vào pending amount của wallet
        try {
            walletService.addPendingAmount(order);
        } catch (Exception e) {
            System.err.println("Failed to add pending amount to wallet: " + e.getMessage());
        }

        // 8️ Map dữ liệu trả về
        return mapToOrderResponseDto(order, subtotal, shippingFeeAmount, totalDiscount, appliedVouchers);
    }
    public List<OrderResponseDto> getOrdersForShipmentManagement() {
        List<Order> orders = orderRepository.findByStatus(StatusOrder.CONFIRMED);

        return orders.stream().map(order -> {
            double subtotal = order.getItems().stream().mapToDouble(OrderItem::getSubtotal).sum();
            double shippingFee = order.getShippingFees().stream()
                    .mapToDouble(ShippingFee::getFeeAmount).sum();
            double discount = order.getVouchers().stream()
                    .mapToDouble(OrderVoucher::getDiscountAmount).sum();
            return mapToOrderResponseDto(order, subtotal, shippingFee, discount, null);
        }).collect(Collectors.toList());
    }

    /**
     *  Lấy chi tiết đơn hàng
     */
    public OrderResponseDto getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        double subtotal = order.getItems().stream().mapToDouble(OrderItem::getSubtotal).sum();
        double shippingFee = order.getShippingFees().stream()
                .mapToDouble(ShippingFee::getFeeAmount).sum();
        double discount = order.getVouchers().stream()
                .mapToDouble(OrderVoucher::getDiscountAmount).sum();
        return mapToOrderResponseDto(order, subtotal, shippingFee, discount, null);
    }

    /**
     *  Lấy danh sách đơn hàng theo user
     */
    public List<OrderSummaryDto> getOrdersByUserId(UUID userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        return orders.stream().map(order -> {
            //  Tính toán các giá trị
            double totalAmount = order.getFinalAmount() != null ? order.getFinalAmount() : 0.0;
            double shippingFee = order.getShippingFees() != null && !order.getShippingFees().isEmpty()
                    ? order.getShippingFees().get(0).getFeeAmount()
                    : 0.0;
            LocalDateTime estimatedDelivery = order.getShippingFees() != null && !order.getShippingFees().isEmpty()
                    ? order.getShippingFees().get(0).getEstimatedDeliveryDate()
                    : null;

            //  Map danh sách sản phẩm (OrderItemResponseDto)
            List<OrderItemResponseDto> itemDtos = order.getItems().stream()
                    .map(item -> OrderItemResponseDto.builder()
                            .id(item.getId())
                            .orderId(order.getId())
                            .productId(item.getVariant().getProduct().getId())
                            .productName(item.getVariant().getProduct().getName())
                            .productImage(
                                    item.getVariant().getProduct().getImages() != null &&
                                            !item.getVariant().getProduct().getImages().isEmpty()
                                            ? item.getVariant().getProduct().getImages().get(0)
                                            : null
                            )
                            .variant(item.getVariant().toDto())
                            .quantity(item.getQuantity())
                            .price(item.getPrice())
                            .subtotal(item.getSubtotal())
                            .createdAt(item.getCreatedAt())
                            .updatedAt(item.getUpdatedAt())
                            .build()
                    ).collect(Collectors.toList());

            //  Lấy avatar shop (nếu có)
            String shopAvatar = order.getShop().getAvatar() != null
                    ? order.getShop().getAvatar()
                    : null;

            //  Tracking number (nếu có trong order)
            String trackingNumber = order.getShippingAddress().getPhoneNumber() != null
                    ? order.getShippingAddress().getPhoneNumber()
                    : "N/A";

            //  Map sang OrderSummaryDto
            return OrderSummaryDto.builder()
                    .id(order.getId())
                    .shopName(order.getShop().getName())
                    .shopAvatar(shopAvatar)
                    .addressId(order.getShippingAddress().getId())
                    .shopId(order.getShop().getId())
                    .status(order.getStatus())
                    .totalAmount(totalAmount)
                    .shippingFee(shippingFee)
                    .createdAt(order.getCreatedAt())
                    .estimatedDelivery(estimatedDelivery)
                    .trackingNumber(trackingNumber)
                    .items(itemDtos)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public boolean cancelOrderByUser(UUID orderId, UUID userId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        //  Kiểm tra quyền sở hữu đơn
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to cancel this order");
        }

        //  Kiểm tra trạng thái đơn
        if (order.getStatus() != StatusOrder.PENDING && order.getStatus() != StatusOrder.CONFIRMED) {
            throw new RuntimeException("Cannot cancel this order at its current status");
        }

        //  Cập nhật trạng thái
        StatusOrder oldStatus = order.getStatus();
        order.setStatus(StatusOrder.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Lưu lịch sử
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(oldStatus);
        history.setToStatus(StatusOrder.CANCELLED);
        history.setNote("Order cancelled by user: " + (reason != null ? reason : "No reason provided"));
        history.setChangedAt(LocalDateTime.now());
        orderStatusHistoryRepository.save(history);

        // Xóa pending amount khi đơn hàng bị hủy
        if (order.getStatus() == StatusOrder.CANCELLED) {
            try {
                walletService.removePendingAmount(order);
            } catch (Exception e) {
                System.err.println("Failed to remove pending amount from wallet: " + e.getMessage());
            }
        }

        //  Nếu cần, xử lý hoàn tiền ở đây
//        Payment payment = order.getPayment();
//        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
//            payment.setStatus(PaymentStatus.REFUNDED);
//            payment.setUpdatedAt(LocalDateTime.now());
//            paymentRepository.save(payment);
//        }

        return true;
    }
    public Page<OrderResponseDto> getOrdersByShopWithFilters(
            UUID shopId,
            StatusOrder status,
            int page,
            int size
    ) {
        Page<Order> orders = getOrdersEntityByShop(shopId, status, page, size);

        return orders.map(order -> {
            double subtotal = order.getItems().stream().mapToDouble(OrderItem::getSubtotal).sum();
            double shippingFee = order.getShippingFees().stream()
                    .mapToDouble(ShippingFee::getFeeAmount).sum();
            double discount = order.getVouchers().stream()
                    .mapToDouble(OrderVoucher::getDiscountAmount).sum();
            return mapToOrderResponseDto(order, subtotal, shippingFee, discount, null);
        });
    }

    /**
     * 📋 Lấy tất cả đơn hàng với pagination và filter theo status
     */
    public Page<OrderResponseDto> getAllOrdersWithFilters(
            StatusOrder status,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders;
        
        if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        return orders.map(order -> {
            double subtotal = order.getItems().stream().mapToDouble(OrderItem::getSubtotal).sum();
            double shippingFee = order.getShippingFees().stream()
                    .mapToDouble(ShippingFee::getFeeAmount).sum();
            double discount = order.getVouchers().stream()
                    .mapToDouble(OrderVoucher::getDiscountAmount).sum();
            return mapToOrderResponseDto(order, subtotal, shippingFee, discount, null);
        });
    }

    private Page<Order> getOrdersEntityByShop(UUID shopId, StatusOrder status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) {
            return orderRepository.findByShopIdAndStatus(shopId, status, pageable);
        }
        return orderRepository.findByShopId(shopId, pageable);
    }


    /**
     *  Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public boolean updateOrderStatus(UpdateOrderStatusDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        StatusOrder oldStatus = order.getStatus();
        order.setStatus(dto.getStatus());
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(oldStatus);
        history.setToStatus(dto.getStatus());
        history.setNote("Status updated to " + dto.getStatus());
        history.setChangedAt(LocalDateTime.now());
        orderStatusHistoryRepository.save(history);

        if (dto.getStatus() == StatusOrder.PACKED) {
            orderTrackingLogService.recordTrackingLog(order, new OrderTrackingLogRequest(
                    "SHOP",                         // Carrier hoặc đơn vị xử lý
                    order.getId().toString(),       // trackingNumber - có thể dùng orderId
                    order.getShop().getAddress().getStreet(),
                    "Đơn hàng đã được đóng gói"
            ));
        }
        // Cập nhật wallet khi đơn hàng hoàn thành
        if (dto.getStatus() == StatusOrder.DELIVERED) {
            try {
                walletService.addOrderPayment(order);
            } catch (Exception e) {
                System.err.println("Failed to add order payment to wallet: " + e.getMessage());
            }
        }
        
        // Xóa pending amount khi đơn hàng bị hủy
        if (dto.getStatus() == StatusOrder.CANCELLED) {
            try {
                walletService.removePendingAmount(order);
            } catch (Exception e) {
                System.err.println("Failed to remove pending amount from wallet: " + e.getMessage());
            }
        }

        return true;
    }

    /**
     *  Chuyển Entity → DTO phản hồi
     */
    private OrderResponseDto mapToOrderResponseDto(Order order, double subtotal,
                                                   double shippingFee, double discount,
                                                   List<OrderVoucherResponseDto> vouchers) {
        AddressResponseDto addressUserDto = null;
        if (order.getShippingAddress() != null && order.getShippingAddress().getAddress() != null) {
            var userAddress = order.getShippingAddress();
            var address = userAddress.getAddress();

            addressUserDto = AddressResponseDto.builder()
                    .id(address.getId())
                    .fullName(userAddress.getRecipient())
                    .phoneNumber(userAddress.getPhoneNumber())
                    .addressLine1(address.getStreet())       // trước là addressLine1, giờ map từ street
                    .addressLine2(address.getCommune() + ", " + address.getDistrict()) // ghép phường + quận
                    .city(address.getCity())                 // city
                    .state("")                               // nếu bạn không có state thì để rỗng hoặc null
                    .postalCode("")                          // nếu bạn không lưu postalCode thì để rỗng
                    .country("Vietnam")                      // nếu mặc định là VN
                    .isDefault(userAddress.isDefault())
                    .createdAt(null)
                    .updatedAt(null)
                    .build();
        }
        AddressResponseDto addressShopDto = null;
        if (order.getShop() != null && order.getShop().getAddress() != null) {
            var shopAddr = order.getShop().getAddress();
            addressShopDto = AddressResponseDto.builder()
                    .id(shopAddr.getId())
                    .fullName(order.getShop().getName())
                    .phoneNumber(order.getShop().getPhoneNumber()) // nếu shop có phone
                    .addressLine1(shopAddr.getStreet())
                    .addressLine2(shopAddr.getCommune() + ", " + shopAddr.getDistrict())
                    .city(shopAddr.getCity())
                    .state("")
                    .postalCode("")
                    .country("Vietnam")
                    .isDefault(false)
                    .createdAt(null)
                    .updatedAt(null)
                    .build();
        }
        return OrderResponseDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getProfile().getFullName())
                .shopId(order.getShop().getId())
                .addressId(order.getShippingAddress().getId())
                .shopName(order.getShop().getName())
                .shopAvatar(order.getShop().getAvatar())
                .addressUser(addressUserDto)
                .addressShop(addressShopDto)
                .shopAddressId(order.getShop().getAddress() != null ? order.getShop().getAddress().getId() : null)
                .status(order.getStatus())
                .totalAmount(subtotal)
                .shippingFee(shippingFee)
                .discountAmount(discount)
                .finalAmount(subtotal + shippingFee - discount)
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())

                //  Items
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponseDto.builder()
                                .id(item.getId())
                                .orderId(order.getId())
                                .productId(item.getVariant().getProduct().getId())
                                .variant(item.getVariant().toDto())
                                .productName(item.getVariant().getProduct().getName())
                                .productImage(
                                        item.getVariant().getProduct().getImages() != null &&
                                                !item.getVariant().getProduct().getImages().isEmpty()
                                                ? item.getVariant().getProduct().getImages().get(0)
                                                : null
                                )
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subtotal(item.getSubtotal())
                                .createdAt(item.getCreatedAt())
                                .updatedAt(item.getUpdatedAt())
                                .build())
                        .collect(Collectors.toList()))

                //  Vouchers (đảm bảo không null id, orderId)
                .vouchers(order.getVouchers().stream()
                        .map(v -> OrderVoucherResponseDto.builder()
                                .id(v.getId())
                                .orderId(order.getId())
                                .voucherId(v.getVoucher().getId())
                                .voucherCode(v.getVoucher().getCode())
                                .discountAmount(v.getDiscountAmount())
                                .description(v.getVoucher().getDescription())
                                .build())
                        .collect(Collectors.toList()))

                //  Shipping Fees
                .shippingFees(order.getShippingFees().stream()
                        .map(f -> ShippingFeeResponseDto.builder()
                                .id(f.getId())
                                .orderId(order.getId())
                                .shippingMethod(f.getShippingMethod())
                                .feeAmount(f.getFeeAmount())
                                .estimatedDeliveryDate(f.getEstimatedDeliveryDate())
                                .build())
                        .collect(Collectors.toList()))

                //  Payment (đảm bảo id, orderId, status, transactionId)
                .payment(order.getPayment() != null
                        ? PaymentResponseDto.builder()
                        .id(order.getPayment().getId())
                        .orderId(order.getId())
                        .method(order.getPayment().getMethod())
                        .status(order.getPayment().getStatus())
                        .amount(order.getPayment().getAmount())
                        .transactionId(order.getPayment().getTransactionId())
                        .paidAt(order.getPayment().getPaidAt())
                        .build()
                        : null)

                //  Status histories
                .statusHistories(order.getStatusHistories().stream()
                        .map(h -> OrderStatusHistoryDto.builder()
                                .id(h.getId())
                                .orderId(order.getId())
                                .fromStatus(h.getFromStatus())
                                .toStatus(h.getToStatus())
                                .note(h.getNote())
                                .changedAt(h.getChangedAt())
                                .build())
                        .collect(Collectors.toList()))

                .build();
    }
}
