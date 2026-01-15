package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Wallet.*;
import com.example.smart_mall_spring.Enum.WithdrawalStatus;
import com.example.smart_mall_spring.Exception.ApiResponse;
import com.example.smart_mall_spring.Services.Wallet.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {
    
    private final WalletService walletService;
    
    /**
     * Tạo ví cho shop với thông tin ngân hàng
     * POST /api/wallets/shops/{shopId}
     * Yêu cầu: Shop owner phải cung cấp thông tin ngân hàng cá nhân
     */
    @PostMapping("/shops/{shopId}")
    @PreAuthorize("@shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @PathVariable UUID shopId,
            @Valid @RequestBody UpdateBankInfoRequest bankInfo) {
        try {
            WalletResponse wallet = walletService.createWallet(shopId, bankInfo);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Ví đã được tạo thành công", wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Lấy thông tin ví của shop
     * GET /api/wallets/shops/{shopId}
     */
    @GetMapping("/shops/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(@PathVariable UUID shopId) {
        try {
            WalletResponse wallet = walletService.getWalletByShopId(shopId);
            return ResponseEntity.ok(ApiResponse.success(wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Cập nhật thông tin ngân hàng
     * PUT /api/wallets/shops/{shopId}/bank-info
     */
    @PutMapping("/shops/{shopId}/bank-info")
    @PreAuthorize("@shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<WalletResponse>> updateBankInfo(
            @PathVariable UUID shopId,
            @Valid @RequestBody UpdateBankInfoRequest request) {
        try {
            WalletResponse wallet = walletService.updateBankInfo(shopId, request);
            return ResponseEntity.ok(ApiResponse.success("Thông tin ngân hàng đã được cập nhật", wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Tạo yêu cầu rút tiền
     * POST /api/wallets/shops/{shopId}/withdrawal-requests
     */
    @PostMapping("/shops/{shopId}/withdrawal-requests")
    @PreAuthorize("@shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> createWithdrawalRequest(
            @PathVariable UUID shopId,
            @Valid @RequestBody WithdrawalRequestDto requestDto) {
        try {
            WithdrawalResponse withdrawal = walletService.createWithdrawalRequest(shopId, requestDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Yêu cầu rút tiền đã được tạo thành công", withdrawal));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách yêu cầu rút tiền của shop
     * GET /api/wallets/shops/{shopId}/withdrawal-requests?page=0&size=10
     */
    @GetMapping("/shops/{shopId}/withdrawal-requests")
    @PreAuthorize("hasRole('ADMIN') or @shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<Page<WithdrawalResponse>>> getWithdrawalRequests(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<WithdrawalResponse> withdrawals = walletService.getWithdrawalRequestsByShop(shopId, pageable);
            return ResponseEntity.ok(ApiResponse.success(withdrawals));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Admin: Lấy danh sách tất cả yêu cầu rút tiền theo trạng thái
     * GET /api/wallets/withdrawal-requests?status=PENDING&page=0&size=10
     */
    @GetMapping("/withdrawal-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<WithdrawalResponse>>> getAllWithdrawalRequests(
            @RequestParam(required = false) WithdrawalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<WithdrawalResponse> withdrawals;
            
            if (status != null) {
                withdrawals = walletService.getWithdrawalRequestsByStatus(status, pageable);
            } else {
                withdrawals = walletService.getWithdrawalRequestsByStatus(WithdrawalStatus.PENDING, pageable);
            }
            
            return ResponseEntity.ok(ApiResponse.success(withdrawals));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Admin: Xử lý yêu cầu rút tiền (phê duyệt hoặc từ chối)
     * PUT /api/wallets/withdrawal-requests/{requestId}/process
     */
    @PutMapping("/withdrawal-requests/{requestId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> processWithdrawalRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody ProcessWithdrawalRequest processRequest,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            WithdrawalResponse withdrawal = walletService.processWithdrawalRequest(
                requestId, processRequest, adminUsername);
            String message = processRequest.getStatus() == WithdrawalStatus.APPROVED 
                    ? "Yêu cầu rút tiền đã được phê duyệt thành công" 
                    : "Yêu cầu rút tiền đã bị từ chối";
            return ResponseEntity.ok(ApiResponse.success(message, withdrawal));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Lấy lịch sử giao dịch của ví
     * GET /api/wallets/shops/{shopId}/transactions?page=0&size=20
     */
    @GetMapping("/shops/{shopId}/transactions")
    @PreAuthorize("hasRole('ADMIN') or @shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactionHistory(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TransactionResponse> transactions = walletService.getTransactionHistory(shopId, pageable);
            return ResponseEntity.ok(ApiResponse.success(transactions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Lấy thống kê tổng quan của ví
     * GET /api/wallets/shops/{shopId}/statistics
     */
    @GetMapping("/shops/{shopId}/statistics")
    @PreAuthorize("hasRole('ADMIN') or @shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWalletStatistics(@PathVariable UUID shopId) {
        try {
            WalletResponse wallet = walletService.getWalletByShopId(shopId);
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("balance", wallet.getBalance());
            statistics.put("totalEarned", wallet.getTotalEarned());
            statistics.put("totalWithdrawn", wallet.getTotalWithdrawn());
            statistics.put("pendingAmount", wallet.getPendingAmount());
            statistics.put("availableForWithdrawal", wallet.getBalance());
            
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Lấy thông tin ví tạm (chưa tạo ví chính)
     * GET /api/wallets/shops/{shopId}/temporary
     */
    @GetMapping("/shops/{shopId}/temporary")
    @PreAuthorize("hasRole('ADMIN') or @shopService.isShopOwner(#shopId, authentication)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTemporaryWallet(@PathVariable UUID shopId) {
        try {
            List<TemporaryWalletResponse> tempWallets = walletService.getTemporaryWalletByShopId(shopId);
            Double totalAmount = walletService.getTemporaryWalletAmount(shopId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("temporaryWallets", tempWallets);
            response.put("totalAmount", totalAmount);
            response.put("count", tempWallets.size());
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Đây là tiền từ các đơn hàng đã hoàn thành khi shop chưa có ví. Tạo ví để nhận tiền này.",
                    response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
