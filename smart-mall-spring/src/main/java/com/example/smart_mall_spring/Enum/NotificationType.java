package com.example.smart_mall_spring.Enum;

/**
 * Enum representing different types of notifications in the system
 */
public enum NotificationType {
    // Order related notifications
    ORDER_CREATED("New Order", "You have a new order to process"),
    ORDER_CONFIRMED("Order Confirmed", "Shop has confirmed your order"),
    ORDER_SHIPPED("Order Shipped", "Your order is being delivered"),
    ORDER_DELIVERED("Order Delivered", "Your order has been delivered successfully"),
    ORDER_CANCELLED("Order Cancelled", "Order has been cancelled"),
    ORDER_COMPLETED("Order Completed", "Order has been completed"),
    ORDER_RETURN_REQUESTED("Return Requested", "There is a new return request"),
    
    // Payment related notifications
    PAYMENT_SUCCESS("Payment Successful", "Your payment has been confirmed"),
    PAYMENT_FAILED("Payment Failed", "Your payment was unsuccessful"),
    REFUND_PROCESSED("Refund Processed", "Money has been refunded to your account"),
    
    // Shop related notifications
    SHOP_APPROVED("Shop Approved", "Your shop has been approved"),
    SHOP_REJECTED("Shop Rejected", "Your shop was not approved"),
    SHOP_MESSAGE("Shop Message", "You have a new message from the shop"),
    PRODUCT_APPROVED("Product Approved", "Your product has been approved"),
    PRODUCT_REJECTED("Product Rejected", "Your product was not approved"),
    
    // Voucher and Promotion notifications
    VOUCHER_RECEIVED("New Voucher", "You have received a new voucher"),
    VOUCHER_EXPIRING("Voucher Expiring", "Your voucher is about to expire"),
    PROMOTION_ALERT("Promotion", "There is a new promotion available"),
    
    // Wallet notifications
    WALLET_CREDITED("Wallet Credited", "Your account has been credited"),
    WALLET_DEBITED("Wallet Debited", "Your account has been debited"),
    WITHDRAWAL_APPROVED("Withdrawal Approved", "Withdrawal request has been processed"),
    WITHDRAWAL_REJECTED("Withdrawal Rejected", "Withdrawal request was rejected"),
    
    // System notifications
    SYSTEM_ANNOUNCEMENT("System Announcement", "Important system announcement"),
    ACCOUNT_WARNING("Account Warning", "Warning about your account"),
    MAINTENANCE_NOTICE("Maintenance Notice", "System will be under maintenance"),
    
    // Admin notifications
    ADMIN_ALERT("Admin Alert", "System requires attention");

    private final String title;
    private final String defaultMessage;

    NotificationType(String title, String defaultMessage) {
        this.title = title;
        this.defaultMessage = defaultMessage;
    }

    public String getTitle() {
        return title;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
