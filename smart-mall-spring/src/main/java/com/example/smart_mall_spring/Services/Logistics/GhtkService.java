package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentLog;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderItem;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Users.UserAddress;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentLogRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GhtkService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ShipmentOrderRepository shipmentOrderRepository;
    private final ShipmentLogRepository shipmentLogRepository;

    @Value("${ghtk.token}")
    private String TOKEN;

    @Value("${ghtk.partner-code}")
    private String PARTNER_CODE;

    private static final String BASE_URL = "https://services.giaohangtietkiem.vn/services/";

    private HttpHeaders defaultHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", TOKEN);
        headers.set("X-Client-Source", PARTNER_CODE);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Tạo đơn hàng GHTK theo dữ liệu input từ client (Postman)
     * orderMap: là object "order" từ JSON
     * productsList: là danh sách products từ JSON
     */
    // ===================== 1️ ĐĂNG ĐƠN GHTK (Body build thủ công từ Map) =====================
    public Map<String, Object> registerOrder(Map<String, Object> orderMap, List<Map<String, Object>> productsList) {
        String url = BASE_URL + "shipment/order/?ver=1.5";
        Map<String, Object> body = new HashMap<>();
        body.put("order", orderMap);
        body.put("products", productsList);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, defaultHeaders());
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        Map<String, Object> result = response.getBody();

        if (response.getStatusCode().is2xxSuccessful() && result != null && Boolean.TRUE.equals(result.get("success"))) {
            return (Map<String, Object>) result.get("order");
        } else {
            throw new RuntimeException("Không thể tạo đơn GHTK: " + (result != null ? result.get("message") : "Lỗi không xác định"));
        }
    }

    // ===================== 2️ ĐĂNG ĐƠN GHTK TỪ ENTITY (chuẩn GHTK) =====================
    public Map<String, Object> registerOrderWithProducts(ShipmentOrder shipmentOrder) {
        String url = BASE_URL + "shipment/order/?ver=1.5";

        Order order = shipmentOrder.getOrder();
        if (order == null) {
            throw new RuntimeException("ShipmentOrder chưa liên kết với Order");
        }
        UserAddress address = order != null ? order.getShippingAddress() : null;
        if (address == null || address.getAddress() == null) {
            throw new RuntimeException("Order chưa có địa chỉ người nhận hợp lệ");
        }

        // ------------------ Tạo Map order ------------------
//        Map<String, Object> orderMap = new HashMap<>();
//        orderMap.put("id", shipmentOrder.getId().toString());
//        orderMap.put("pick_name", "Kho tổng SmartMall");
//        orderMap.put("pick_address", "590 Cách Mạng Tháng 8, Phường 11, Quận 3");
//        orderMap.put("pick_province", "TP. Hồ Chí Minh");
//        orderMap.put("pick_district", "Quận 3");
//        orderMap.put("pick_ward", "Phường 11");
//        orderMap.put("pick_tel", "0911222333");
        // ------------------ Tạo Map order ------------------
        Map<String, Object> orderMap = new HashMap<>();
        orderMap.put("id", shipmentOrder.getId().toString());

        // Lấy thông tin kho từ ShipmentOrder hoặc cấu hình (ví dụ cột warehouseName)
        orderMap.put("pick_name", shipmentOrder.getWarehouse().getName() != null ?
                shipmentOrder.getWarehouse().getName()  : "Kho tổng SmartMall");
        orderMap.put("pick_address", shipmentOrder.getWarehouse().getAddress() != null ?
                shipmentOrder.getWarehouse().getAddress() : "590 Cách Mạng Tháng 8, Phường 11, Quận 3");
        orderMap.put("pick_province", shipmentOrder.getWarehouse().getProvince() != null ?
                shipmentOrder.getWarehouse().getProvince() : "TP. Hồ Chí Minh");
        orderMap.put("pick_district", shipmentOrder.getWarehouse().getDistrict() != null ?
                shipmentOrder.getWarehouse().getDistrict() : "Quận 3");
        orderMap.put("pick_ward", shipmentOrder.getWarehouse().getWard() != null ?
                shipmentOrder.getWarehouse().getWard()  : "Phường 11");
        orderMap.put("pick_tel", shipmentOrder.getWarehouse().getPhone() != null ?
                shipmentOrder.getWarehouse().getPhone() : "0911222333");

        // ------------------ Thông tin người nhận ------------------
        if (address != null && address.getAddress() != null) {
            Address addr = address.getAddress();
            orderMap.put("name", address.getUser().getProfile().getFullName());
            orderMap.put("tel", address.getPhoneNumber());
            orderMap.put("address", addr.getStreet());
            orderMap.put("province", addr.getCity());
            orderMap.put("district", addr.getDistrict());
            orderMap.put("ward", addr.getCommune());
            orderMap.put("hamlet", "Khác"); // bắt buộc nếu không có street
        } else {
            orderMap.put("name", "Nguyễn Văn A");
            orderMap.put("tel", "0911222333");
            orderMap.put("address", "123 Nguyễn Chí Thanh");
            orderMap.put("province", "TP. Hồ Chí Minh");
            orderMap.put("district", "Quận 1");
            orderMap.put("ward", "Phường Bến Nghé");
            orderMap.put("hamlet", "Khác");
        }
        double shippingFee =  order.getShippingFee() != null ? order.getShippingFee() : 0.0;
        orderMap.put("is_freeship", shippingFee == 0.0 ? "1" : "0");
        orderMap.put("pick_money", shipmentOrder.getCodAmount() != null ? shipmentOrder.getCodAmount() : BigDecimal.ZERO);
        orderMap.put("value",  order.getTotalAmount() != null ? BigDecimal.valueOf(order.getTotalAmount()) : BigDecimal.ZERO);
        orderMap.put("note", "Đơn test tạo từ SmartMall");
        orderMap.put("transport", "fly");
        orderMap.put("pick_option", "cod");
        orderMap.put("weight_option", "kg"); // đảm bảo GHTK hiểu kg

        // ------------------ Clone sản phẩm sang list mutable và check weight ------------------
        List<Map<String, Object>> productsList = new ArrayList<>();
        double totalWeight = 0.0;

        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant == null) {
                throw new RuntimeException("OrderItem " + item.getId() + " chưa liên kết ProductVariant");
            }

            double weight = variant.getWeight() != null ? variant.getWeight() : 0.1;
            if (weight > 20) {
                throw new RuntimeException("Sản phẩm " + variant.getProduct().getName() + " vượt quá khối lượng tối đa 20kg");
            }

            totalWeight += weight * (item.getQuantity() != null ? item.getQuantity() : 1);

            Map<String, Object> p = new HashMap<>();
            p.put("name", variant.getProduct() != null && variant.getProduct().getName() != null
                    ? variant.getProduct().getName() : "Unnamed Product");
            p.put("weight", weight); // kg
            p.put("quantity", item.getQuantity() != null ? item.getQuantity() : 1);
            p.put("product_code", variant.getSku() != null ? variant.getSku() : "");
            productsList.add(p);
        }

        if (totalWeight >= 20) {
            throw new RuntimeException("Tổng khối lượng đơn hàng >= 20kg, không thể gửi GHTK");
        }

        orderMap.put("total_weight", totalWeight);

        // ------------------ Build body ------------------
        Map<String, Object> body = new HashMap<>();
        body.put("order", orderMap);
        body.put("products", productsList);

        System.out.println("===== BODY GỬI GHTK =====");
        System.out.println(body);
        System.out.println("=========================");

        // ------------------ Gửi request ------------------
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, defaultHeaders());
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        Map<String, Object> result = response.getBody();

        if (response.getStatusCode().is2xxSuccessful() && result != null && Boolean.TRUE.equals(result.get("success"))) {
            Map<String, Object> data = (Map<String, Object>) result.get("order");

            shipmentOrder.setTrackingCode((String) data.get("label"));
            shipmentOrder.setStatus(ShipmentStatus.REGISTERED);
            shipmentOrderRepository.save(shipmentOrder);

            log(shipmentOrder, "Tạo đơn GHTK thành công: " + data.get("label"));
            return data;
        } else {
            String msg = result != null ? result.get("message").toString() : "Không rõ lỗi từ GHTK";
            log(shipmentOrder, "Tạo đơn GHTK thất bại: " + msg);
            throw new RuntimeException("Không thể tạo đơn GHTK: " + msg);
        }
    }
    public ShipmentStatus fetchAndUpdateOrderStatus(String trackingCode) {
        String url = BASE_URL + "shipment/v2/" + trackingCode;
        HttpEntity<Void> request = new HttpEntity<>(defaultHeaders());

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
        Map<String, Object> result = response.getBody();

        if (response.getStatusCode().is2xxSuccessful() && result != null && Boolean.TRUE.equals(result.get("success"))) {
            Map<String, Object> orderData = (Map<String, Object>) result.get("order");

            // Lấy status từ GHTK và chuyển sang String
            Object statusObj = orderData.get("status");
            String ghtkStatus = statusObj != null ? statusObj.toString() : "1"; // mặc định "1" = PENDING

            // Map sang enum của app
            ShipmentStatus status = mapGhtkStatusToEnum(ghtkStatus);

            ShipmentOrder order = shipmentOrderRepository.findByTrackingCode(trackingCode)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + trackingCode));
            order.setStatus(status);
            shipmentOrderRepository.save(order);

            log(order, "Cập nhật trạng thái đơn hàng thành: " + status + " (GHTK status: " + ghtkStatus + ")");
            return status;
        } else {
            throw new RuntimeException("Không thể lấy trạng thái từ GHTK: " + (result != null ? result.get("message") : ""));
        }
    }

    /**
     * Map status GHTK (string) sang enum ShipmentStatus của app
     */
    private ShipmentStatus mapGhtkStatusToEnum(String ghtkStatus) {
        switch (ghtkStatus) {
            case "1": return ShipmentStatus.PENDING;      // Chưa tiếp nhận
            case "2": return ShipmentStatus.PICKING_UP;   // Đang lấy hàng
            case "3": return ShipmentStatus.IN_TRANSIT;   // Đang trung chuyển
            case "4": return ShipmentStatus.DELIVERED;    // Đã giao
            case "5": return ShipmentStatus.CANCELLED;    // Hủy
            default: return ShipmentStatus.PENDING;
        }
    }


    /** ------------------------- 3️ HỦY ĐƠN HÀNG --------------------------- **/
    public void cancelOrder(String trackingCode) {
        String url = BASE_URL + "shipment/cancel/" + trackingCode;
        HttpEntity<Void> request = new HttpEntity<>(defaultHeaders());

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
        Map<String, Object> result = response.getBody();

        if (response.getStatusCode().is2xxSuccessful() && result != null && Boolean.TRUE.equals(result.get("success"))) {
            ShipmentOrder order = shipmentOrderRepository.findByTrackingCode(trackingCode)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + trackingCode));
            order.setStatus(ShipmentStatus.CANCELLED);
            shipmentOrderRepository.save(order);
            log(order, "Hủy đơn hàng thành công");
        } else {
            log(null, "Hủy đơn hàng GHTK thất bại: " + (result != null ? result.get("message") : "Không rõ lỗi"));
            throw new RuntimeException("Không thể hủy đơn GHTK");
        }
    }

    /** ------------------------- 4️ IN NHÃN VẬN ĐƠN ----------------------- **/
    public byte[] printLabel(String trackingCode) {
        String url = BASE_URL + "label/" + trackingCode + "?original=portrait&page_size=A6";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", TOKEN);
        headers.set("X-Client-Source", PARTNER_CODE);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                byte[].class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            log(null, "In nhãn vận đơn thành công cho mã: " + trackingCode);
            return response.getBody(); // Trả về PDF
        } else {
            throw new RuntimeException("Không thể in nhãn vận đơn, status: " + response.getStatusCode());
        }
    }

    /** ------------------------- 5️ TÍNH PHÍ VẬN CHUYỂN ------------------- **/
    public BigDecimal calculateShippingFee(String pickAddress, String deliverAddress, BigDecimal weight) {
        String url = BASE_URL + "shipment/fee";
        Map<String, Object> params = new HashMap<>();
        params.put("pick_address", pickAddress);
        params.put("address", deliverAddress);
        params.put("weight", weight);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(params, defaultHeaders());
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> body = response.getBody();
            if (Boolean.TRUE.equals(body.get("success"))) {
                Map<String, Object> feeData = (Map<String, Object>) body.get("fee");
                BigDecimal fee = new BigDecimal(feeData.get("fee").toString());
                log(null, "Tính phí vận chuyển thành công: " + fee);
                return fee;
            }
        }
        throw new RuntimeException("Không thể tính phí GHTK");
    }

    /** ------------------------- 6️ HỖ TRỢ: GHI LOG ------------------------ **/
    private void log(ShipmentOrder order, String message) {
        try {
            ShipmentLog log = new ShipmentLog();
            log.setShipmentOrder(order);
            log.setMessage(message);
            log.setTimestamp(LocalDateTime.now());
            shipmentLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Lỗi ghi log GHTK: " + e.getMessage());
        }
    }
}
