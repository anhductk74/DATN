package com.example.smart_mall_spring.Dtos.Notification;

import com.example.smart_mall_spring.Enum.NotificationStatus;
import com.example.smart_mall_spring.Enum.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for notification data transfer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private NotificationStatus status;
    private UUID referenceId;
    private String referenceType;
    private String metadata;
    private String imageUrl;
    private String deepLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
