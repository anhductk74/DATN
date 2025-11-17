package com.example.smart_mall_spring.Config;

import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Wallet.ShopWallet;
import com.example.smart_mall_spring.Entities.Wallet.TemporaryWallet;
import com.example.smart_mall_spring.Entities.Wallet.WalletTransaction;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Enum.TransactionType;
import com.example.smart_mall_spring.Repositories.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TemporaryWalletDataSync {
    
    private final OrderRepository orderRepository;
    private final ShopWalletRepository walletRepository;
    private final TemporaryWalletRepository temporaryWalletRepository;
    private final WalletTransactionRepository transactionRepository;
    
    @PostConstruct
    @Transactional
    public void syncCompletedOrders() {
        try {
            System.out.println("===== BẮT ĐẦU ĐỒNG BỘ ORDERS DELIVERED VÀO VÍ TẠM =====");
            
            // Lấy tất cả đơn hàng DELIVERED
            List<Order> deliveredOrders = orderRepository.findByStatus(StatusOrder.DELIVERED);
            
            if (deliveredOrders.isEmpty()) {
                System.out.println("Không có đơn hàng DELIVERED nào cần đồng bộ.");
                return;
            }
            
            int syncedToTempWallet = 0;
            int syncedToMainWallet = 0;
            int alreadySynced = 0;
            
            for (Order order : deliveredOrders) {
                // Kiểm tra xem đơn hàng đã được xử lý chưa
                boolean existsInTransaction = transactionRepository.existsByOrderId(order.getId());
                boolean existsInTempWallet = temporaryWalletRepository.existsByOrderId(order.getId());
                
                if (existsInTransaction || existsInTempWallet) {
                    alreadySynced++;
                    continue;
                }
                
                // Kiểm tra shop có ví chưa
                ShopWallet wallet = walletRepository.findByShopId(order.getShop().getId())
                    .orElse(null);
                
                if (wallet == null) {
                    // Shop chưa có ví → Lưu vào ví tạm
                    TemporaryWallet tempWallet = new TemporaryWallet();
                    tempWallet.setShop(order.getShop());
                    tempWallet.setOrder(order);
                    tempWallet.setAmount(order.getFinalAmount());
                    tempWallet.setIsTransferred(false);
                    tempWallet.setNote("Đồng bộ đơn hàng DELIVERED từ " + order.getUpdatedAt().toLocalDate());
                    
                    temporaryWalletRepository.save(tempWallet);
                    syncedToTempWallet++;
                    
                    System.out.println("✓ Đồng bộ vào ví tạm - Order: " + order.getId() + 
                                     ", Shop: " + order.getShop().getName() + 
                                     ", Amount: " + order.getFinalAmount());
                } else {
                    // Shop đã có ví → Cập nhật ví chính
                    Double balanceBefore = wallet.getBalance();
                    
                    wallet.setBalance(wallet.getBalance() + order.getFinalAmount());
                    wallet.setTotalEarned(wallet.getTotalEarned() + order.getFinalAmount());
                    
                    // Trừ pending nếu có
                    if (wallet.getPendingAmount() >= order.getFinalAmount()) {
                        wallet.setPendingAmount(wallet.getPendingAmount() - order.getFinalAmount());
                    }
                    
                    walletRepository.save(wallet);
                    
                    // Tạo transaction
                    WalletTransaction transaction = new WalletTransaction();
                    transaction.setWallet(wallet);
                    transaction.setType(TransactionType.ORDER_PAYMENT);
                    transaction.setAmount(order.getFinalAmount());
                    transaction.setBalanceBefore(balanceBefore);
                    transaction.setBalanceAfter(wallet.getBalance());
                    transaction.setOrder(order);
                    transaction.setDescription("Đồng bộ thanh toán từ đơn hàng #" + order.getId());
                    transaction.setReferenceCode(order.getId().toString());
                    
                    transactionRepository.save(transaction);
                    syncedToMainWallet++;
                    
                    System.out.println("✓ Đồng bộ vào ví chính - Order: " + order.getId() + 
                                     ", Shop: " + order.getShop().getName() + 
                                     ", Amount: " + order.getFinalAmount());
                }
            }
            
            System.out.println("===== KẾT QUẢ ĐỒNG BỘ =====");
            System.out.println("Tổng số đơn hàng DELIVERED: " + deliveredOrders.size());
            System.out.println("Đã đồng bộ vào ví tạm: " + syncedToTempWallet);
            System.out.println("Đã đồng bộ vào ví chính: " + syncedToMainWallet);
            System.out.println("Đã được đồng bộ trước đó: " + alreadySynced);
            System.out.println("=====================================");
            
        } catch (Exception e) {
            System.err.println("LỖI khi đồng bộ orders vào ví tạm: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
