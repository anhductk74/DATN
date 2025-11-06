package com.example.smart_mall_spring.Services.Products;


import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Entities.Products.ProductVariant;
import com.example.smart_mall_spring.Entities.Products.VariantAttribute;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Models.ApprovalMessage;
import com.example.smart_mall_spring.Repositories.ProductRepository;

@Service
public class ProductApprovalQueueService {

    @Autowired
    @Qualifier("productApprovalQueue")
    private BlockingQueue<ApprovalMessage> approvalQueue;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Đưa một sản phẩm cụ thể vào hàng đợi duyệt
     */
    public boolean enqueueProductForApproval(UUID productId) {
        try {
            // Kiểm tra xem product đã có trong hàng đợi chưa
            if (isProductAlreadyInQueue(productId)) {
                System.out.println("[ProductApprovalQueueService] ⏭️ Product " + productId + " already in queue");
                return false;
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            ApprovalMessage approvalMessage = createApprovalMessage(product);

            boolean added = approvalQueue.offer(approvalMessage);

            if (added) {
                System.out.println("[ProductApprovalQueueService] ✅ Product " + productId + " added to approval queue");
                return true;
            } else {
                System.err.println("[ProductApprovalQueueService] ❌ Failed to add product " + productId + " (queue full)");
                return false;
            }

        } catch (Exception e) {
            System.err.println("[ProductApprovalQueueService] ❌ Error enqueuing product " + productId + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra xem productId đã tồn tại trong hàng đợi chưa
     */
    private boolean isProductAlreadyInQueue(UUID productId) {
        return approvalQueue.stream()
                .anyMatch(msg -> msg.getProductId().equals(productId));
    }

    /**
     * Đưa tất cả sản phẩm có trạng thái PENDING (chờ duyệt) vào hàng đợi
     */
    @Transactional(readOnly = true)
    public int enqueuePendingProducts() {
        try {
            List<Product> pendingProducts = productRepository.findByStatus(Status.INACTIVE);

            int enqueuedCount = 0;
            int duplicateCount = 0;

            for (Product product : pendingProducts) {
                if (isProductAlreadyInQueue(product.getId())) {
                    duplicateCount++;
                    System.out.println("[ProductApprovalQueueService] ⏭️ Skipped product " + product.getId() + " (already in queue)");
                    continue;
                }

                ApprovalMessage approvalMessage = createApprovalMessage(product);

                if (approvalQueue.offer(approvalMessage)) {
                    enqueuedCount++;
                    System.out.println("[ProductApprovalQueueService] ✅ Product " + product.getId() + " enqueued");
                } else {
                    System.err.println("[ProductApprovalQueueService] ❌ Queue full, skipped product " + product.getId());
                    break;
                }
            }

            System.out.println("[ProductApprovalQueueService] 📊 Total pending: " + pendingProducts.size() +
                    ", enqueued: " + enqueuedCount +
                    ", duplicates skipped: " + duplicateCount);
            return enqueuedCount;

        } catch (Exception e) {
            System.err.println("[ProductApprovalQueueService] ❌ Error enqueueing pending products: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Chuyển entity Product sang ApprovalMessage (model hàng đợi)
     */
    private ApprovalMessage createApprovalMessage(Product product) {
        List<String> imageUrls = product.getImages() != null
                ? product.getImages()
                : List.of();

        List<ApprovalMessage.ProductVariant> variants = product.getVariants() != null
                ? product.getVariants().stream().map(variant ->
                ApprovalMessage.ProductVariant.builder()
                        .sku(variant.getSku())
                        .price(variant.getPrice())
                        .stock(variant.getStock())
                        .weight(variant.getWeight())
                        .dimensions(variant.getDimensions())
                        .attributes(
                                variant.getAttributes() != null
                                        ? variant.getAttributes().stream()
                                        .map(attr -> new ApprovalMessage.VariantAttribute(
                                                attr.getAttributeName(),
                                                attr.getAttributeValue()))
                                        .collect(Collectors.toList())
                                        : List.of()
                        )
                        .build()
        ).collect(Collectors.toList())
                : List.of();

        return ApprovalMessage.builder()
                .productId(product.getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .shopId(product.getShop() != null ? product.getShop().getId() : null)
                .name(product.getName())
                .description(product.getDescription())
                .brand(product.getBrand())
                .status(product.getStatus())
                .images(imageUrls)
                .variants(variants)
                .build();
    }

    /**
     * Lấy trạng thái queue hiện tại
     */
    public QueueStatus getQueueStatus() {
        int queueSize = approvalQueue.size();
        int remainingCapacity = approvalQueue.remainingCapacity();
        int totalCapacity = queueSize + remainingCapacity;
        return new QueueStatus(queueSize, totalCapacity, remainingCapacity);
    }

    /**
     * Xóa toàn bộ queue (trường hợp khẩn cấp)
     */
    public int clearQueue() {
        int cleared = approvalQueue.size();
        approvalQueue.clear();
        System.out.println("[ProductApprovalQueueService] 🧹 Cleared " + cleared + " items from queue");
        return cleared;
    }

    /**
     * Lấy danh sách product IDs đang nằm trong queue
     */
    public List<UUID> getCurrentQueueProductIds() {
        return approvalQueue.stream()
                .map(ApprovalMessage::getProductId)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lần xuất hiện của một product cụ thể trong queue
     */
    public int countProductInQueue(UUID productId) {
        return (int) approvalQueue.stream()
                .filter(msg -> msg.getProductId().equals(productId))
                .count();
    }

    // Inner class thống kê trạng thái queue
    public static class QueueStatus {
        private final int currentSize;
        private final int totalCapacity;
        private final int remainingCapacity;

        public QueueStatus(int currentSize, int totalCapacity, int remainingCapacity) {
            this.currentSize = currentSize;
            this.totalCapacity = totalCapacity;
            this.remainingCapacity = remainingCapacity;
        }

        public int getCurrentSize() {
            return currentSize;
        }

        public int getTotalCapacity() {
            return totalCapacity;
        }

        public int getRemainingCapacity() {
            return remainingCapacity;
        }

        public double getUsagePercentage() {
            return totalCapacity > 0 ? (double) currentSize / totalCapacity * 100 : 0;
        }

        @Override
        public String toString() {
            return String.format("QueueStatus{size=%d/%d (%.1f%%), remaining=%d}",
                    currentSize, totalCapacity, getUsagePercentage(), remainingCapacity);
        }
    }
}
