package com.example.smart_mall_spring.Services.Products;



import com.example.smart_mall_spring.Entities.Products.Product;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Models.ApprovalMessage;
import com.example.smart_mall_spring.Repositories.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

@Component
public class ProductApprovalWorker {

    @Autowired
    @Qualifier("productApprovalQueue")
    private BlockingQueue<ApprovalMessage> approvalQueue;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductApprovalQueueService approvalQueueService;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 10000;
    private static final String GEMINI_API_URL = "http://localhost:5001/ai_approval_product";
    private static final String APPROVAL_LOG_CSV = "product_approval_log.csv";

    public ProductApprovalWorker() {
        this.restTemplate = new RestTemplateBuilder().build();
        this.objectMapper = new ObjectMapper();
        initializeCsvFile();
    }

    // ============================= CORE PROCESS =============================

    public void processApprovalQueue() {
        try {
            ApprovalMessage job = approvalQueue.poll(1, TimeUnit.SECONDS);
            if (job == null) return;

            System.out.println("[ProductApprovalWorker] Processing product: " + job.getProductId());

            try {
                ApprovalResult result = callGeminiApprovalAPI(job);
                if (result != null) {
                    updateProductApprovalStatus(job.getProductId(), result);
                    System.out.println("[ProductApprovalWorker] ✅ Product " + job.getProductId() + " processed with status: " + result.getStatus());
                } else {
                    handleApprovalFailure(job, new Exception("Null result from AI"));
                }
            } catch (Exception e) {
                handleApprovalFailure(job, e);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("[ProductApprovalWorker] Worker interrupted");
        } catch (Exception e) {
            System.err.println("[ProductApprovalWorker] Unexpected error: " + e.getMessage());
        }
    }

    // ============================= AI CALL =============================

    private ApprovalResult callGeminiApprovalAPI(ApprovalMessage job) throws Exception {
        // chỉ gửi các thông tin liên quan đến sản phẩm
        var requestBody = new ProductApprovalRequest(
                job.getProductId(),
                job.getName(),
                job.getDescription(),
                job.getBrand(),
                job.getCategoryId(),
                job.getShopId(),
                job.getStatus(),
                job.getImages(),
                job.getVariants()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

        System.out.println("[ProductApprovalWorker] Calling AI API for product: " + job.getProductId());

        ResponseEntity<String> response = restTemplate.exchange(
                GEMINI_API_URL, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            JsonNode json = objectMapper.readTree(response.getBody());
            ApprovalResult result = new ApprovalResult();
            result.setStatus(json.get("status").asInt());

            JsonNode contentNode = json.get("content");
            if (contentNode != null) {
                result.setContent(contentNode.toString());
            }

            return result;
        } else {
            throw new Exception("API call failed with status: " + response.getStatusCode());
        }
    }

    // ============================= DB UPDATE =============================


    private void updateProductApprovalStatus(UUID productId, ApprovalResult result) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            if (result.getStatus() == 1) {
                product.setStatus(Status.ACTIVE);
                logToCSV(product.getName(), "APPROVED", "AI xác nhận hợp lệ");
                System.out.println("[ProductApprovalWorker] ✅ Product " + productId + " APPROVED");
            } else if (result.getStatus() == 2) {
                product.setStatus(Status.REJECTED);
                logToCSV(product.getName(), "REJECTED", result.getContent());
                System.out.println("[ProductApprovalWorker] ❌ Product " + productId + " REJECTED: " + result.getContent());
            }

            productRepository.save(product);

        } catch (Exception e) {
            System.err.println("[ProductApprovalWorker] Failed to update product " + productId + ": " + e.getMessage());
        }
    }

    // ============================= RETRY =============================

    private void handleApprovalFailure(ApprovalMessage job, Exception e) {
        System.err.println("[ProductApprovalWorker] Failed to process product " + job.getProductId() + ": " + e.getMessage());
        job.setRetryCount(job.getRetryCount() + 1);

        if (job.getRetryCount() < MAX_RETRY_ATTEMPTS) {
            scheduleRetry(job, RETRY_DELAY_MS * job.getRetryCount());
        } else {
            System.err.println("[ProductApprovalWorker] Max retries reached for product " + job.getProductId());
        }
    }

    private void scheduleRetry(ApprovalMessage job, long delayMs) {
        new Thread(() -> {
            try {
                Thread.sleep(delayMs);
                approvalQueue.offer(job);
                System.out.println("[ProductApprovalWorker] Re-queued product " + job.getProductId());
            } catch (InterruptedException ignored) {}
        }).start();
    }

    // ============================= CSV LOG =============================

    private void initializeCsvFile() {
        try {
            Path csvPath = Paths.get(APPROVAL_LOG_CSV);
            if (!Files.exists(csvPath)) {
                try (FileWriter writer = new FileWriter(APPROVAL_LOG_CSV, true)) {
                    writer.append("Timestamp,Product Name,Status,Reason\n");
                }
            }
        } catch (IOException e) {
            System.err.println("[ProductApprovalWorker] ❌ Failed to init CSV: " + e.getMessage());
        }
    }

    private void logToCSV(String productName, String status, String reason) {
        try (FileWriter writer = new FileWriter(APPROVAL_LOG_CSV, true)) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            writer.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    timestamp,
                    productName.replace(",", ";"),
                    status,
                    reason.replace(",", ";")));
            System.out.println("[ProductApprovalWorker] 📝 Logged: " + productName + " - " + status);
        } catch (IOException e) {
            System.err.println("[ProductApprovalWorker] ❌ Failed to log CSV: " + e.getMessage());
        }
    }

    // ============================= SCHEDULES =============================

    @Scheduled(fixedRate = 600000) // mỗi 10 phút
    public void scheduleEnqueuePendingProducts() {
        try {
            int count = approvalQueueService.enqueuePendingProducts();
            if (count > 0) {
                System.out.println("[ProductApprovalWorker] Added " + count + " pending products to queue");
            }
        } catch (Exception e) {
            System.err.println("[ProductApprovalWorker] Error enqueue: " + e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 12,0 * * *") // 12:00 trưa & 0:00 đêm
    public void scheduleAutoApproval() {
        try {
            while (!approvalQueue.isEmpty()) {
                ApprovalMessage job = approvalQueue.poll(5, TimeUnit.SECONDS);
                if (job == null) break;

                try {
                    ApprovalResult result = callGeminiApprovalAPI(job);
                    if (result != null) {
                        updateProductApprovalStatus(job.getProductId(), result);
                    }
                    Thread.sleep(2000);
                } catch (Exception e) {
                    handleApprovalFailure(job, e);
                }
            }
        } catch (Exception e) {
            System.err.println("[ProductApprovalWorker] Error auto approval: " + e.getMessage());
        }
    }

    // ============================= INNER CLASS =============================
    private static class ApprovalResult {
        private int status;
        private String content;
        public int getStatus() { return status; }
        public void setStatus(int status) { this.status = status; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    private record ProductApprovalRequest(
            UUID productId,
            String name,
            String description,
            String brand,
            UUID categoryId,
            UUID shopId,
            Object status,
            java.util.List<String> images,
            Object variants
    ) {}
}
