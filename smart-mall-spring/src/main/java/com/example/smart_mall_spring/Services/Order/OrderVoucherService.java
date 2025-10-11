package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Dtos.Orders.OrderVoucher.ApplyVoucherRequestDto;
import com.example.smart_mall_spring.Dtos.Orders.OrderVoucher.OrderVoucherResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderVoucher;

import com.example.smart_mall_spring.Entities.Orders.Voucher;
import com.example.smart_mall_spring.Enum.DiscountType;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Repositories.OrderVoucherRepository;
import com.example.smart_mall_spring.Repositories.VoucherRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderVoucherService {

    @Autowired
    private OrderVoucherRepository orderVoucherRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private OrderRepository orderRepository;

    public OrderVoucherResponseDto applyVoucher(ApplyVoucherRequestDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Voucher voucher = voucherRepository.findById(dto.getVoucherId())
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        //  Logic tính giá trị giảm
        Double discountAmount = calculateDiscount(order, voucher);

        //  Tạo record mới
        OrderVoucher orderVoucher = new OrderVoucher();
        orderVoucher.setOrder(order);
        orderVoucher.setVoucher(voucher);
        orderVoucher.setDiscountAmount(discountAmount);

        orderVoucherRepository.save(orderVoucher);

        return OrderVoucherResponseDto.builder()
                .id(orderVoucher.getId())
                .orderId(order.getId())
                .voucherId(voucher.getId())
                .voucherCode(voucher.getCode())
                .discountAmount(discountAmount)
                .build();
    }

    private Double calculateDiscount(Order order, Voucher voucher) {
        double orderTotal = order.getTotalAmount();
        double discount = 0.0;

        // Nếu đơn hàng không đủ giá trị tối thiểu => không áp dụng
        if (voucher.getMinOrderValue() != null && orderTotal < voucher.getMinOrderValue()) {
            return 0.0;
        }

        // Xử lý logic giảm giá
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderTotal * (voucher.getDiscountValue() / 100.0);

            // Nếu có giới hạn giảm tối đa => giới hạn lại
            if (voucher.getMaxDiscountAmount() != null && discount > voucher.getMaxDiscountAmount()) {
                discount = voucher.getMaxDiscountAmount();
            }

        } else if (voucher.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = voucher.getDiscountValue();
            // Không thể giảm quá tổng tiền
            if (discount > orderTotal) discount = orderTotal;
        }

        return discount;
    }

    public List<OrderVoucherResponseDto> getVouchersByOrder(UUID orderId) {
        return orderVoucherRepository.findByOrderId(orderId)
                .stream()
                .map(ov -> OrderVoucherResponseDto.builder()
                        .id(ov.getId())
                        .orderId(ov.getOrder().getId())
                        .voucherId(ov.getVoucher().getId())
                        .voucherCode(ov.getVoucher().getCode())
                        .discountAmount(ov.getDiscountAmount())
                        .build())
                .collect(Collectors.toList());
    }

    public void removeVoucher(UUID orderVoucherId) {
        orderVoucherRepository.deleteById(orderVoucherId);
    }
}
