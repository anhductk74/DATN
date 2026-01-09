package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Config.VNPayConfig;
import com.example.smart_mall_spring.Dtos.Orders.Transaction.TransactionResponseDto;
import com.example.smart_mall_spring.Dtos.Orders.Transaction.VnPayPaymentResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.Payment;
import com.example.smart_mall_spring.Entities.Orders.Transaction;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.PaymentStatus;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.OrderRepository;
import com.example.smart_mall_spring.Repositories.PaymentRepository;
import com.example.smart_mall_spring.Repositories.TransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service xử lý thanh toán qua VNPay:
 * - Tạo URL thanh toán
 * - Xử lý callback khi thanh toán xong
 * - Thực hiện hoàn tiền (refund)
 */
@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VNPayConfig vnPayConfig;
    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    /**
     *  Tạo URL thanh toán VNPay
     */
    public String createPaymentUrl(
            HttpServletRequest request,
            double amount,
            String orderInfo,
            User user,
            String platform
    ) {
        try {
            // 1️⃣ Tạo mã giao dịch
            String vnp_TxnRef = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 12);

            // 2️⃣ Lấy IP client (chuẩn cho server / docker)
            String vnp_IpAddr = getClientIp(request);

            // 3️⃣ Tạo thời gian theo UTC+7 (VNPay bắt buộc)
            TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
            SimpleDateFormat formatter =
                    new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(tz);

            Calendar calendar = Calendar.getInstance(tz);
            String vnp_CreateDate = formatter.format(calendar.getTime());

            calendar.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(calendar.getTime());

            // 4️⃣ Return URL theo platform
            String returnUrl = "mobile".equalsIgnoreCase(platform)
                    ? vnPayConfig.getReturnUrlMobile()
                    : vnPayConfig.getReturnUrlWeb();

            // 5️⃣ Khởi tạo params
            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            params.put("vnp_Amount", String.valueOf((long) (amount * 100)));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", vnp_TxnRef);
            params.put("vnp_OrderInfo", orderInfo);
            params.put("vnp_OrderType", "other");
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", returnUrl);
            params.put("vnp_IpAddr", vnp_IpAddr);
            params.put("vnp_CreateDate", vnp_CreateDate);
            params.put("vnp_ExpireDate", vnp_ExpireDate);

            // 6️⃣ Sort params + build hash & query
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (String field : fieldNames) {
                String value = params.get(field);
                if (value != null && !value.isEmpty()) {
                    String encodedValue =
                            URLEncoder.encode(value, StandardCharsets.US_ASCII);
                    hashData.append(field)
                            .append('=')
                            .append(encodedValue)
                            .append('&');
                    query.append(URLEncoder.encode(field, StandardCharsets.US_ASCII))
                            .append('=')
                            .append(encodedValue)
                            .append('&');
                }
            }

            // Xóa dấu &
            hashData.setLength(hashData.length() - 1);
            query.setLength(query.length() - 1);

            // 7️⃣ Tạo SecureHash
            String secureHash =
                    hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());

            // 8️⃣ Tạo URL thanh toán
            String paymentUrl =
                    vnPayConfig.getVnpUrl()
                            + "?"
                            + query
                            + "&vnp_SecureHash="
                            + secureHash;

            // 9️⃣ Lưu Transaction
            Transaction tx = new Transaction();
            tx.setTransactionCode(vnp_TxnRef);
            tx.setAmount(amount);
            tx.setDescription(orderInfo);
            tx.setTransactionType(1); // payment
            tx.setTransactionDate(new Date(System.currentTimeMillis()));
            tx.setStatus(0); // pending
            tx.setUser(user);

            try {
                String orderId = extractOrderIdFromInfo(orderInfo);
                if (orderId != null) {
                    UUID orderUUID = UUID.fromString(orderId);
                    orderRepository.findById(orderUUID)
                            .ifPresent(tx::setOrder);
                }
            } catch (Exception ignored) {}

            transactionRepository.save(tx);

            return paymentUrl;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Error creating VNPay payment URL",
                    e
            );
        }
    }
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }


    /**
     *  Xử lý callback trả về từ VNPay
     */
    public VnPayPaymentResponseDto handlePaymentReturn(Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_TransactionNo = params.get("vnp_TransactionNo"); // Mã giao dịch thực tế từ VNPay

        Optional<Transaction> optionalTx = transactionRepository.findByTransactionCode(vnp_TxnRef);
        if (optionalTx.isEmpty()) {
            return new VnPayPaymentResponseDto(vnp_TxnRef, vnp_ResponseCode, 2, "Transaction not found");
        }

        Transaction tx = optionalTx.get();

        if ("00".equals(vnp_ResponseCode)) {
            //  Thanh toán thành công
            tx.setStatus(1); // 1 = thành công
            tx.setTransactionDate(new Date(System.currentTimeMillis()));
            tx.setBankTransactionName(vnp_TransactionNo);

            transactionRepository.save(tx);

            // Cập nhật trạng thái đơn hàng
            if (tx.getOrder() != null) {
                Order order = tx.getOrder();
                order.setStatus(StatusOrder.CONFIRMED);
                orderRepository.save(order);
                if (order.getPayment() != null) {
                    Payment payment = order.getPayment();
                    payment.setStatus(PaymentStatus.SUCCESS); // hoặc PaymentStatus.PAID nếu enum của bạn là thế
                    payment.setTransactionId(vnp_TransactionNo);
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                }
            }

            return new VnPayPaymentResponseDto(vnp_TxnRef, vnp_ResponseCode, 1, "Payment successful");

        }
        // 3. Xử lý thất bại
        tx.setStatus(2); // 2 = thất bại
        tx.setTransactionDate(new Date(System.currentTimeMillis()));
        transactionRepository.save(tx);

        if (tx.getOrder() != null) {
            Order order = tx.getOrder();

            // tuỳ chọn: tự động huỷ đơn khi thanh toán thất bại
            order.setStatus(StatusOrder.CANCELLED);
            orderRepository.save(order);

            if (order.getPayment() != null) {
                Payment payment = order.getPayment();
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
        }

            return new VnPayPaymentResponseDto(vnp_TxnRef, vnp_ResponseCode, 2, "Payment failed - error code: " + vnp_ResponseCode);

    }

    /**
     * Xử lý hoàn tiền
     */
    public VnPayPaymentResponseDto refundPayment(String originalTxnCode, double amount, User user) {
        Optional<Transaction> optionalTx = transactionRepository.findByTransactionCode(originalTxnCode);
        if (optionalTx.isEmpty()) {
            return new VnPayPaymentResponseDto(originalTxnCode, "404", 2, "Transaction not found for refund");
        }

        Transaction refund = new Transaction();
        refund.setTransactionCode("REFUND_" + originalTxnCode);
        refund.setAmount(amount);
        refund.setDescription("Refund for transaction " + originalTxnCode);
        refund.setTransactionType(3); // 3 = refund
        refund.setTransactionDate(new Date(System.currentTimeMillis()));
        refund.setStatus(1); // 1 = success
        refund.setUser(user);
        transactionRepository.save(refund);

        return new VnPayPaymentResponseDto(refund.getTransactionCode(), "00", 1, "Refund successful");
    }

    /**
     * Hàm tạo chữ ký HMAC SHA512
     */
    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);
        byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder result = new StringBuilder();
        for (byte b : hash) result.append(String.format("%02x", b));
        return result.toString();
    }

    /**
     *  Helper: Lấy OrderId từ orderInfo (ví dụ: "OrderId:xxx|Thanh toan don hang")
     */
    private String extractOrderIdFromInfo(String orderInfo) {
        if (orderInfo != null && orderInfo.startsWith("OrderId:")) {
            String[] parts = orderInfo.split("\\|");
            if (parts.length > 0) {
                return parts[0].substring(8); // bỏ prefix "OrderId:"
            }
        }
        return null;
    }

    /**
     * Chuyển Transaction Entity sang DTO
     */
    private TransactionResponseDto convertToTransactionResponseDto(Transaction transaction) {
        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .transactionCode(transaction.getTransactionCode())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .transactionType(transaction.getTransactionType())
                .transactionDate(transaction.getTransactionDate())
                .status(transaction.getStatus())
                .bankTransactionName(transaction.getBankTransactionName())
                .userId(transaction.getUser() != null ? transaction.getUser().getId() : null)
                .userName(transaction.getUser() != null ? transaction.getUser().getUsername() : null)
                .orderId(transaction.getOrder() != null ? transaction.getOrder().getId() : null)
                .orderCode(transaction.getOrder() != null ? transaction.getOrder().getId().toString() : null)
                .build();
    }
}
