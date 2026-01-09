package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest.OrderReturnMapper;
import com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest.OrderReturnRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderReturnRequest.OrderReturnResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderReturnImage;
import com.example.smart_mall_spring.Entities.Orders.OrderReturnRequest;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.ReturnStatus;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Repositories.OrderReturnImageRepository;
import com.example.smart_mall_spring.Repositories.OrderReturnRequestRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.example.smart_mall_spring.Enum.StatusOrder.DELIVERED;

@Service
@RequiredArgsConstructor
public class OrderReturnRequestService {

    private final OrderReturnRequestRepository returnRequestRepository;
    private final OrderReturnImageRepository returnImageRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final OrderReturnMapper mapper;

    /**
     * User gửi yêu cầu hoàn trả hàng
     */
    @Transactional
    public OrderReturnResponseDto createReturnRequest(OrderReturnRequestDto dto, UUID userId) {
        //  Kiểm tra order
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        //  Kiểm tra user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!order.getStatus().equals(StatusOrder.DELIVERED)) {
            throw new RuntimeException("Refund requests can only be submitted for orders that have been shipped..");
        }
        boolean existsPending = returnRequestRepository.existsByOrderIdAndStatus(dto.getOrderId(), ReturnStatus.PENDING);
        if (existsPending) {
            throw new RuntimeException("You have submitted a refund request for this order and it is pending.");
        }
        //  Tạo đối tượng yêu cầu hoàn trả
        OrderReturnRequest request = OrderReturnRequest.builder()
                .order(order)
                .user(user)
                .reason(dto.getReason())
                .status(ReturnStatus.PENDING)
                .requestDate(LocalDateTime.now())
                .images(new ArrayList<>())
                .build();

        //  Lưu yêu cầu ban đầu
        OrderReturnRequest savedRequest = returnRequestRepository.save(request);

        //  Upload ảnh lên Cloudinary
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            for (MultipartFile file : dto.getImages()) {
                Map<String, String> uploaded = cloudinaryService.uploadFileToFolder(file, "return_requests");

                OrderReturnImage image = OrderReturnImage.builder()
                        .url(uploaded.get("url"))
                        .publicId(uploaded.get("publicId"))
                        .orderReturnRequest(savedRequest)
                        .build();

                returnImageRepository.save(image);
                savedRequest.getImages().add(image);
            }
        }

        //  Trả về DTO phản hồi
        return mapper.toResponseDto(savedRequest);
    }

    /**
     * Lấy danh sách yêu cầu hoàn trả theo user
     */
    public List<OrderReturnResponseDto> getReturnRequestsByUser(UUID userId) {
        List<OrderReturnRequest> requests = returnRequestRepository.findByUserId(userId);
        return requests.stream().map(mapper::toResponseDto).toList();
    }

    /**
     * Lấy danh sách yêu cầu hoàn trả theo order
     */
    public List<OrderReturnResponseDto> getReturnRequestsByOrder(UUID orderId) {
        List<OrderReturnRequest> requests = returnRequestRepository.findByOrderId(orderId);
        return requests.stream().map(mapper::toResponseDto).toList();
    }

    public List<OrderReturnResponseDto> getReturnRequestsByShop(UUID shopId) {
        List<OrderReturnRequest> requests = returnRequestRepository.findByShopId(shopId);
        return requests.stream().map(mapper::toResponseDto).toList();
    }

    @Transactional
    public OrderReturnResponseDto updateReturnStatusByShop(UUID requestId, ReturnStatus newStatus) {
        OrderReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        // Shop chỉ được phép xử lý khi trạng thái hiện tại là PENDING hoặc APPROVED
        if (request.getStatus() == ReturnStatus.REJECTED || request.getStatus() == ReturnStatus.COMPLETED) {
            throw new RuntimeException("This request has already been processed and cannot be changed");
        }

        // Cho phép chuyển từ PENDING → APPROVED/REJECTED
        // hoặc từ APPROVED → COMPLETED
        if (request.getStatus() == ReturnStatus.PENDING &&
                (newStatus == ReturnStatus.APPROVED || newStatus == ReturnStatus.REJECTED)) {
            request.setStatus(newStatus);
        }
        else if (request.getStatus() == ReturnStatus.APPROVED && newStatus == ReturnStatus.COMPLETED) {
            request.setStatus(newStatus);
        }
        else {
            throw new RuntimeException("Trạng thái cập nhật không hợp lệ.");
        }

        request.setProcessedDate(LocalDateTime.now());
        returnRequestRepository.save(request);

        // Cập nhật trạng thái đơn hàng tương ứng
        Order order = request.getOrder();
        switch (newStatus) {
            case APPROVED -> order.setStatus(StatusOrder.RETURN_REQUESTED);
            case REJECTED -> order.setStatus(StatusOrder.DELIVERED);
            case COMPLETED -> order.setStatus(StatusOrder.RETURNED);
            default -> {}
        }

        orderRepository.save(order);

        return mapper.toResponseDto(request);
    }


    /**
     * Admin xử lý yêu cầu hoàn trả
     */
    @Transactional
    public OrderReturnResponseDto updateReturnStatus(UUID requestId, ReturnStatus newStatus) {
        OrderReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hoàn trả."));

        request.setStatus(newStatus);
        request.setProcessedDate(LocalDateTime.now());
        returnRequestRepository.save(request);

        // 🔹 Cập nhật trạng thái Order tương ứng
        Order order = request.getOrder();

        switch (newStatus) {
            case APPROVED -> order.setStatus(StatusOrder.RETURN_REQUESTED);
            case REJECTED -> order.setStatus(DELIVERED);
            case COMPLETED  -> order.setStatus(StatusOrder.RETURNED);
            default -> { /* giữ nguyên trạng thái nếu là PENDING */ }
        }

        orderRepository.save(order);

        return mapper.toResponseDto(request);
    }
}