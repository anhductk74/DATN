package com.example.smart_mall_spring.Services.Wallet;

import com.example.smart_mall_spring.Dtos.Wallet.*;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Entities.Wallet.ShopWallet;
import com.example.smart_mall_spring.Entities.Wallet.TemporaryWallet;
import com.example.smart_mall_spring.Entities.Wallet.WalletTransaction;
import com.example.smart_mall_spring.Entities.Wallet.WithdrawalRequest;
import com.example.smart_mall_spring.Enum.TransactionType;
import com.example.smart_mall_spring.Enum.WithdrawalStatus;
import com.example.smart_mall_spring.Repositories.ShopRepository;
import com.example.smart_mall_spring.Repositories.ShopWalletRepository;
import com.example.smart_mall_spring.Repositories.TemporaryWalletRepository;
import com.example.smart_mall_spring.Repositories.WalletTransactionRepository;
import com.example.smart_mall_spring.Repositories.WithdrawalRequestRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {
    
    private final ShopWalletRepository walletRepository;
    private final WithdrawalRequestRepository withdrawalRepository;
    private final WalletTransactionRepository transactionRepository;
    private final ShopRepository shopRepository;
    private final TemporaryWalletRepository temporaryWalletRepository;
    
    // Tạo ví cho shop với thông tin ngân hàng
    @Transactional
    public WalletResponse createWallet(UUID shopId, UpdateBankInfoRequest bankInfo) {
        Shop shop = shopRepository.findById(shopId)
            .orElseThrow(() -> new RuntimeException("Shop không tồn tại"));
        
        if (walletRepository.existsByShopId(shopId)) {
            throw new RuntimeException("Shop đã có ví");
        }
        
        // Kiểm tra thông tin ngân hàng
        if (bankInfo == null || 
            bankInfo.getBankName() == null || bankInfo.getBankName().trim().isEmpty() ||
            bankInfo.getBankAccountNumber() == null || bankInfo.getBankAccountNumber().trim().isEmpty() ||
            bankInfo.getBankAccountName() == null || bankInfo.getBankAccountName().trim().isEmpty()) {
            throw new RuntimeException("Thông tin ngân hàng không được để trống");
        }
        
        // Lấy tổng số tiền từ ví tạm
        List<TemporaryWallet> temporaryWallets = temporaryWalletRepository.findByShopIdAndIsTransferredFalse(shopId);
        Double temporaryAmount = temporaryWallets.stream()
            .mapToDouble(TemporaryWallet::getAmount)
            .sum();
        
        ShopWallet wallet = new ShopWallet();
        wallet.setShop(shop);
        wallet.setBalance(temporaryAmount); // Cộng tiền từ ví tạm
        wallet.setTotalEarned(temporaryAmount); // Cộng vào tổng thu nhập
        wallet.setTotalWithdrawn(0.0);
        wallet.setPendingAmount(0.0);
        wallet.setBankName(bankInfo.getBankName());
        wallet.setBankAccountNumber(bankInfo.getBankAccountNumber());
        wallet.setBankAccountName(bankInfo.getBankAccountName());
        wallet.setIsActive(true);
        
        wallet = walletRepository.save(wallet);
        
        // Chuyển tiền từ ví tạm sang ví chính
        if (!temporaryWallets.isEmpty()) {
            transferFromTemporaryWallet(wallet, temporaryWallets);
        }
        
        return mapToWalletResponse(wallet);
    }
    
    // Chuyển tiền từ ví tạm sang ví chính
    @Transactional
    private void transferFromTemporaryWallet(ShopWallet wallet, List<TemporaryWallet> temporaryWallets) {
        Double balanceBefore = 0.0; // Ví mới tạo nên balance before = 0
        
        for (TemporaryWallet tempWallet : temporaryWallets) {
            // Tạo transaction cho mỗi đơn hàng từ ví tạm
            WalletTransaction transaction = new WalletTransaction();
            transaction.setWallet(wallet);
            transaction.setType(TransactionType.ORDER_PAYMENT);
            transaction.setAmount(tempWallet.getAmount());
            transaction.setBalanceBefore(balanceBefore);
            balanceBefore += tempWallet.getAmount();
            transaction.setBalanceAfter(balanceBefore);
            transaction.setOrder(tempWallet.getOrder());
            transaction.setDescription("Chuyển từ ví tạm - Đơn hàng #" + tempWallet.getOrder().getId());
            transaction.setReferenceCode(tempWallet.getOrder().getId().toString());
            
            transactionRepository.save(transaction);
            
            // Đánh dấu ví tạm đã chuyển
            tempWallet.setIsTransferred(true);
            tempWallet.setTransferredAt(LocalDateTime.now());
            tempWallet.setNote("Đã chuyển vào ví chính");
            temporaryWalletRepository.save(tempWallet);
        }
        
        System.out.println("Đã chuyển " + temporaryWallets.size() + " giao dịch từ ví tạm sang ví chính cho shop: " + wallet.getShop().getName());
    }
    
    // Lấy thông tin ví
    public WalletResponse getWalletByShopId(UUID shopId) {
        ShopWallet wallet = walletRepository.findByShopId(shopId)
            .orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
        
        return mapToWalletResponse(wallet);
    }
    
    // Lấy thông tin ví tạm của shop
    public List<TemporaryWalletResponse> getTemporaryWalletByShopId(UUID shopId) {
        List<TemporaryWallet> tempWallets = temporaryWalletRepository.findByShopIdAndIsTransferredFalse(shopId);
        
        return tempWallets.stream()
            .map(this::mapToTemporaryWalletResponse)
            .collect(Collectors.toList());
    }
    
    // Lấy tổng số tiền trong ví tạm
    public Double getTemporaryWalletAmount(UUID shopId) {
        return temporaryWalletRepository.getTotalTemporaryAmount(shopId);
    }
    
    // Cập nhật thông tin ngân hàng
    @Transactional
    public WalletResponse updateBankInfo(UUID shopId, UpdateBankInfoRequest request) {
        ShopWallet wallet = walletRepository.findByShopId(shopId)
            .orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
        
        wallet.setBankName(request.getBankName());
        wallet.setBankAccountNumber(request.getBankAccountNumber());
        wallet.setBankAccountName(request.getBankAccountName());
        
        wallet = walletRepository.save(wallet);
        
        return mapToWalletResponse(wallet);
    }
    
    // Cập nhật số dư khi đơn hàng hoàn thành
    @Transactional
    public void addOrderPayment(Order order) {
        ShopWallet wallet = walletRepository.findByShopId(order.getShop().getId())
            .orElse(null);
        
        Double amount = order.getFinalAmount();
        
        // Nếu shop chưa có ví, lưu vào ví tạm
        if (wallet == null) {
            // Kiểm tra xem đơn hàng này đã được lưu vào ví tạm chưa
            if (!temporaryWalletRepository.existsByOrderId(order.getId())) {
                TemporaryWallet tempWallet = new TemporaryWallet();
                tempWallet.setShop(order.getShop());
                tempWallet.setOrder(order);
                tempWallet.setAmount(amount);
                tempWallet.setIsTransferred(false);
                tempWallet.setNote("Đơn hàng hoàn thành khi shop chưa có ví");
                
                temporaryWalletRepository.save(tempWallet);
                
                System.out.println("Shop chưa có ví, đã lưu vào ví tạm: " + amount + " VNĐ cho đơn hàng: " + order.getId());
            }
            return;
        }
        
        // Shop đã có ví, cập nhật bình thường
        Double balanceBefore = wallet.getBalance();
        
        wallet.setBalance(wallet.getBalance() + amount);
        wallet.setTotalEarned(wallet.getTotalEarned() + amount);
        
        if (wallet.getPendingAmount() >= amount) {
            wallet.setPendingAmount(wallet.getPendingAmount() - amount);
        }
        
        walletRepository.save(wallet);
        
        // Tạo giao dịch
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setType(TransactionType.ORDER_PAYMENT);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(wallet.getBalance());
        transaction.setOrder(order);
        transaction.setDescription("Thanh toán từ đơn hàng #" + order.getId());
        transaction.setReferenceCode(order.getId().toString());
        
        transactionRepository.save(transaction);
    }
    
    // Đánh dấu số tiền đang chờ (khi đơn hàng được tạo)
    @Transactional
    public void addPendingAmount(Order order) {
        ShopWallet wallet = walletRepository.findByShopId(order.getShop().getId())
            .orElse(null);
        
        if (wallet == null) {
            System.out.println("Shop chưa tạo ví, bỏ qua cập nhật pending amount cho đơn hàng: " + order.getId());
            return;
        }
        
        wallet.setPendingAmount(wallet.getPendingAmount() + order.getFinalAmount());
        walletRepository.save(wallet);
    }
    
    // Giảm số tiền đang chờ (khi đơn hàng bị hủy)
    @Transactional
    public void removePendingAmount(Order order) {
        ShopWallet wallet = walletRepository.findByShopId(order.getShop().getId())
            .orElse(null);
        
        if (wallet == null) {
            System.out.println("Shop chưa tạo ví, bỏ qua xóa pending amount cho đơn hàng: " + order.getId());
            return;
        }
        
        wallet.setPendingAmount(Math.max(0, wallet.getPendingAmount() - order.getFinalAmount()));
        walletRepository.save(wallet);
    }
    
    // Tạo yêu cầu rút tiền
    @Transactional
    public WithdrawalResponse createWithdrawalRequest(UUID shopId, WithdrawalRequestDto requestDto) {
        ShopWallet wallet = walletRepository.findByShopId(shopId)
            .orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
        
        if (!wallet.getIsActive()) {
            throw new RuntimeException("Ví đã bị khóa");
        }
        
        if (wallet.getBalance() < requestDto.getAmount()) {
            throw new RuntimeException("Số dư không đủ");
        }
        
        WithdrawalRequest withdrawal = new WithdrawalRequest();
        withdrawal.setShop(wallet.getShop());
        withdrawal.setWallet(wallet);
        withdrawal.setAmount(requestDto.getAmount());
        withdrawal.setStatus(WithdrawalStatus.PENDING);
        withdrawal.setBankName(requestDto.getBankName());
        withdrawal.setBankAccountNumber(requestDto.getBankAccountNumber());
        withdrawal.setBankAccountName(requestDto.getBankAccountName());
        withdrawal.setNote(requestDto.getNote());
        
        withdrawal = withdrawalRepository.save(withdrawal);
        
        return mapToWithdrawalResponse(withdrawal);
    }
    
    // Admin xử lý yêu cầu rút tiền
    @Transactional
    public WithdrawalResponse processWithdrawalRequest(UUID requestId, ProcessWithdrawalRequest processRequest, String adminUsername) {
        WithdrawalRequest withdrawal = withdrawalRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Yêu cầu rút tiền không tồn tại"));
        
        if (withdrawal.getStatus() != WithdrawalStatus.PENDING) {
            throw new RuntimeException("Yêu cầu đã được xử lý");
        }
        
        withdrawal.setStatus(processRequest.getStatus());
        withdrawal.setAdminNote(processRequest.getAdminNote());
        withdrawal.setProcessedBy(adminUsername);
        withdrawal.setProcessedAt(LocalDateTime.now());
        
        if (processRequest.getStatus() == WithdrawalStatus.APPROVED) {
            ShopWallet wallet = withdrawal.getWallet();
            
            if (wallet.getBalance() < withdrawal.getAmount()) {
                throw new RuntimeException("Số dư không đủ");
            }
            
            Double balanceBefore = wallet.getBalance();
            wallet.setBalance(wallet.getBalance() - withdrawal.getAmount());
            wallet.setTotalWithdrawn(wallet.getTotalWithdrawn() + withdrawal.getAmount());
            walletRepository.save(wallet);
            
            // Tạo giao dịch rút tiền
            WalletTransaction transaction = new WalletTransaction();
            transaction.setWallet(wallet);
            transaction.setType(TransactionType.WITHDRAWAL);
            transaction.setAmount(-withdrawal.getAmount());
            transaction.setBalanceBefore(balanceBefore);
            transaction.setBalanceAfter(wallet.getBalance());
            transaction.setWithdrawalRequest(withdrawal);
            transaction.setDescription("Rút tiền - Yêu cầu #" + withdrawal.getId());
            transaction.setReferenceCode(withdrawal.getId().toString());
            
            transactionRepository.save(transaction);
            
            // Cập nhật trạng thái thành COMPLETED khi đã chuyển tiền
            withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        }
        
        withdrawal = withdrawalRepository.save(withdrawal);
        
        return mapToWithdrawalResponse(withdrawal);
    }
    
    // Lấy danh sách yêu cầu rút tiền của shop
    public Page<WithdrawalResponse> getWithdrawalRequestsByShop(UUID shopId, Pageable pageable) {
        return withdrawalRepository.findByShopIdOrderByCreatedAtDesc(shopId, pageable)
            .map(this::mapToWithdrawalResponse);
    }
    
    // Admin lấy danh sách yêu cầu rút tiền theo trạng thái
    public Page<WithdrawalResponse> getWithdrawalRequestsByStatus(WithdrawalStatus status, Pageable pageable) {
        return withdrawalRepository.findByStatusOrderByCreatedAtAsc(status, pageable)
            .map(this::mapToWithdrawalResponse);
    }
    
    // Lấy lịch sử giao dịch
    public Page<TransactionResponse> getTransactionHistory(UUID shopId, Pageable pageable) {
        ShopWallet wallet = walletRepository.findByShopId(shopId)
            .orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
        
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable)
            .map(this::mapToTransactionResponse);
    }
    
    // Helper methods
    private WalletResponse mapToWalletResponse(ShopWallet wallet) {
        return WalletResponse.builder()
            .id(wallet.getId())
            .shopId(wallet.getShop().getId())
            .shopName(wallet.getShop().getName())
            .balance(wallet.getBalance())
            .totalEarned(wallet.getTotalEarned())
            .totalWithdrawn(wallet.getTotalWithdrawn())
            .pendingAmount(wallet.getPendingAmount())
            .bankName(wallet.getBankName())
            .bankAccountNumber(wallet.getBankAccountNumber())
            .bankAccountName(wallet.getBankAccountName())
            .isActive(wallet.getIsActive())
            .createdAt(wallet.getCreatedAt())
            .updatedAt(wallet.getUpdatedAt())
            .build();
    }
    
    private WithdrawalResponse mapToWithdrawalResponse(WithdrawalRequest withdrawal) {
        return WithdrawalResponse.builder()
            .id(withdrawal.getId())
            .shopId(withdrawal.getShop().getId())
            .shopName(withdrawal.getShop().getName())
            .walletId(withdrawal.getWallet().getId())
            .amount(withdrawal.getAmount())
            .status(withdrawal.getStatus())
            .bankName(withdrawal.getBankName())
            .bankAccountNumber(withdrawal.getBankAccountNumber())
            .bankAccountName(withdrawal.getBankAccountName())
            .note(withdrawal.getNote())
            .adminNote(withdrawal.getAdminNote())
            .processedBy(withdrawal.getProcessedBy())
            .processedAt(withdrawal.getProcessedAt())
            .createdAt(withdrawal.getCreatedAt())
            .updatedAt(withdrawal.getUpdatedAt())
            .build();
    }
    
    private TransactionResponse mapToTransactionResponse(WalletTransaction transaction) {
        return TransactionResponse.builder()
            .id(transaction.getId())
            .walletId(transaction.getWallet().getId())
            .type(transaction.getType())
            .amount(transaction.getAmount())
            .balanceBefore(transaction.getBalanceBefore())
            .balanceAfter(transaction.getBalanceAfter())
            .orderId(transaction.getOrder() != null ? transaction.getOrder().getId() : null)
            .withdrawalRequestId(transaction.getWithdrawalRequest() != null ? transaction.getWithdrawalRequest().getId() : null)
            .description(transaction.getDescription())
            .referenceCode(transaction.getReferenceCode())
            .createdAt(transaction.getCreatedAt())
            .build();
    }
    
    private TemporaryWalletResponse mapToTemporaryWalletResponse(TemporaryWallet tempWallet) {
        return TemporaryWalletResponse.builder()
            .id(tempWallet.getId())
            .shopId(tempWallet.getShop().getId())
            .shopName(tempWallet.getShop().getName())
            .orderId(tempWallet.getOrder().getId())
            .amount(tempWallet.getAmount())
            .isTransferred(tempWallet.getIsTransferred())
            .transferredAt(tempWallet.getTransferredAt())
            .note(tempWallet.getNote())
            .createdAt(tempWallet.getCreatedAt())
            .build();
    }
}
