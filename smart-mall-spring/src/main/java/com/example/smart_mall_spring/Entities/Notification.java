package com.example.smart_mall_spring.Entities;

import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.NotificationStatus;
import com.example.smart_mall_spring.Enum.NotificationType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing a notification in the system
 * Stores notifications for users, shops, and admins
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_status", columnList = "user_id,status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, exclude = {"user"})
@ToString(exclude = {"user"})
public class Notification extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;
    
    // Reference to related entity (order_id, product_id, etc.)
    @Column(name = "reference_id")
    private UUID referenceId;
    
    @Column(name = "reference_type")
    private String referenceType; // e.g., "ORDER", "PRODUCT", "SHOP"
    
    // Additional data in JSON format
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    // Image/icon URL for the notification
    @Column(name = "image_url")
    private String imageUrl;
    
    // Deep link for mobile app navigation
    @Column(name = "deep_link")
    private String deepLink;
}
