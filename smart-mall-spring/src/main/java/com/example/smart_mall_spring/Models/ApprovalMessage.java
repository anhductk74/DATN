package com.example.smart_mall_spring.Models;

import java.util.List;
import java.util.UUID;

import com.example.smart_mall_spring.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ProductApprovalMessage
 * Model dùng cho việc gửi thông tin sản phẩm chờ duyệt
 * (ví dụ: gửi đến hàng đợi kiểm duyệt hoặc log tracking).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalMessage {
    private UUID productId;
    private UUID categoryId;
    private UUID shopId;

    private String name;
    private String description;
    private String brand;

    private Status status;

    // Danh sách ảnh sản phẩm (link hoặc tên file)
    private List<String> images;

    // Danh sách biến thể (variant)
    private List<ProductVariant> variants;

    @Builder.Default
    private int retryCount = 0;

    @Builder.Default
    private long timestamp = System.currentTimeMillis();

    // ==================== INNER CLASSES ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariant {
        private String sku;
        private Double price;
        private Integer stock;
        private Double weight;
        private String dimensions;
        private List<VariantAttribute> attributes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantAttribute {
        private String attributeName;
        private String attributeValue;
    }

    // ==================== toString ====================
    @Override
    public String toString() {
        return "ProductApprovalMessage{" +
                "productId=" + productId +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", retryCount=" + retryCount +
                ", timestamp=" + timestamp +
                '}';
    }
}
