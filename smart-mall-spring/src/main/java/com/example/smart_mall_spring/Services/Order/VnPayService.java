package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Config.VNPayConfig;
import com.example.smart_mall_spring.Dtos.Orders.Transaction.VnPayPaymentResponseDto;
import com.example.smart_mall_spring.Entities.Orders.Transaction;
import com.example.smart_mall_spring.Entities.Users.User;
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
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VNPayConfig vnPayConfig;
    private final TransactionRepository transactionRepository;

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createPaymentUrl(HttpServletRequest request, double amount, String orderInfo, User user) {
        try {
            String vnp_TxnRef = UUID.randomUUID().toString().substring(0, 8);
            String vnp_IpAddr = request.getRemoteAddr();
            String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date(System.currentTimeMillis()));

            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            params.put("vnp_Amount", String.valueOf((long) amount * 100));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", vnp_TxnRef);
            params.put("vnp_OrderInfo", orderInfo);
            params.put("vnp_OrderType", "other");
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl() + "?userId=" + user.getId());
            params.put("vnp_IpAddr", vnp_IpAddr);
            params.put("vnp_CreateDate", vnp_CreateDate);

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (String field : fieldNames) {
                String value = params.get(field);
                if (value != null && !value.isEmpty()) {
                    hashData.append(field).append('=')
                            .append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                            .append('&');
                    query.append(URLEncoder.encode(field, StandardCharsets.US_ASCII))
                            .append('=')
                            .append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                            .append('&');
                }
            }

            String hashValue = hmacSHA512(vnPayConfig.getHashSecret(), hashData.substring(0, hashData.length() - 1));
            String paymentUrl = vnPayConfig.getVnpUrl() + "?" + query + "vnp_SecureHash=" + hashValue;

            // Lưu transaction
            Transaction tx = new Transaction();
            tx.setTransactionCode(vnp_TxnRef);
            tx.setAmount(amount);
            tx.setDescription(orderInfo);
            tx.setTransactionType(1);
            tx.setTransactionDate(new Date(System.currentTimeMillis()));
            tx.setStatus(0);
            tx.setUser(user);
            transactionRepository.save(tx);

            return paymentUrl;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo URL thanh toán VNPay: " + e.getMessage());
        }
    }

    /**
     * Xử lý callback sau thanh toán
     */
    public VnPayPaymentResponseDto handlePaymentReturn(Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");

        Optional<Transaction> optionalTx = transactionRepository.findByTransactionCode(vnp_TxnRef);
        if (optionalTx.isEmpty()) {
            return new VnPayPaymentResponseDto(vnp_TxnRef, vnp_ResponseCode, 2, "Không tìm thấy giao dịch");
        }

        Transaction tx = optionalTx.get();
        tx.setStatus("00".equals(vnp_ResponseCode) ? 1 : 2);
        tx.setTransactionDate(new Date(System.currentTimeMillis()));
        transactionRepository.save(tx);

        String message = "00".equals(vnp_ResponseCode)
                ? "Thanh toán thành công"
                : "Thanh toán thất bại - mã lỗi: " + vnp_ResponseCode;

        return new VnPayPaymentResponseDto(vnp_TxnRef, vnp_ResponseCode, tx.getStatus(), message);
    }

    /**
     * Refund (hoàn tiền)
     */
    public VnPayPaymentResponseDto refundPayment(String originalTxnCode, double amount, User user) {
        Optional<Transaction> optionalTx = transactionRepository.findByTransactionCode(originalTxnCode);
        if (optionalTx.isEmpty()) {
            return new VnPayPaymentResponseDto(originalTxnCode, "404", 2, "Không tìm thấy giao dịch để hoàn tiền");
        }

        Transaction refund = new Transaction();
        refund.setTransactionCode("REFUND_" + originalTxnCode);
        refund.setAmount(amount);
        refund.setDescription("Hoàn tiền cho giao dịch " + originalTxnCode);
        refund.setTransactionType(3);
        refund.setTransactionDate(new Date(System.currentTimeMillis()));
        refund.setStatus(1);
        refund.setUser(user);
        transactionRepository.save(refund);

        return new VnPayPaymentResponseDto(
                refund.getTransactionCode(),
                "00",
                refund.getStatus(),
                "Hoàn tiền thành công"
        );
    }

    // Hàm ký HMAC SHA512
    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);
        byte[] hash = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();
        for (byte b : hash) result.append(String.format("%02x", b));
        return result.toString();
    }
}