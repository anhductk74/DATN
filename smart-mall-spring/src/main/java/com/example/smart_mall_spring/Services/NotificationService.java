package com.example.smart_mall_spring.Services;

import com.example.smart_mall_spring.Dtos.Notification.NotificationDto;
import com.example.smart_mall_spring.Dtos.Notification.NotificationRequestDto;
import com.example.smart_mall_spring.Entities.Notification;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.NotificationStatus;
import com.example.smart_mall_spring.Enum.NotificationType;
import com.example.smart_mall_spring.Exception.EntityNotFoundException;
import com.example.smart_mall_spring.Repositories.NotificationRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Create and send a notification to a user
     */
    @Transactional
    @Async
    public void createAndSendNotification(NotificationRequestDto requestDto) {
        try {
            User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + requestDto.getUserId()));
            
            Notification notification = Notification.builder()
                .user(user)
                .type(requestDto.getType())
                .title(requestDto.getTitle())
                .message(requestDto.getMessage())
                .status(NotificationStatus.UNREAD)
                .referenceId(requestDto.getReferenceId())
                .referenceType(requestDto.getReferenceType())
                .metadata(requestDto.getMetadata())
                .imageUrl(requestDto.getImageUrl())
                .deepLink(requestDto.getDeepLink())
                .build();
            
            notification = notificationRepository.save(notification);
            
            // Send real-time notification via WebSocket
            NotificationDto notificationDto = convertToDto(notification);
            sendWebSocketNotification(user.getId(), notificationDto);
            
            log.info("Notification created and sent to user: {}, type: {}", user.getId(), requestDto.getType());
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Create notification for multiple users
     */
    @Transactional
    @Async
    public void createBulkNotification(List<UUID> userIds, NotificationType type, String title, 
                                      String message, UUID referenceId, String referenceType) {
        for (UUID userId : userIds) {
            NotificationRequestDto requestDto = NotificationRequestDto.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
            createAndSendNotification(requestDto);
        }
    }
    
    /**
     * Send notification to all admin users
     */
    @Transactional
    @Async
    public void sendToAdmins(NotificationType type, String title, String message, 
                            UUID referenceId, String referenceType) {
        // Find all admin users
        List<User> admins = userRepository.findAll().stream()
            .filter(user -> user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getName())))
            .collect(Collectors.toList());
        
        for (User admin : admins) {
            NotificationRequestDto requestDto = NotificationRequestDto.builder()
                .userId(admin.getId())
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
            createAndSendNotification(requestDto);
        }
        
        log.info("Notification sent to {} admins", admins.size());
    }
    
    /**
     * Get all notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable)
            .map(this::convertToDto);
    }
    
    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUnreadNotifications(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        return notificationRepository.findByUserAndStatusOrderByCreatedAtDesc(
            user, NotificationStatus.UNREAD, pageable
        ).map(this::convertToDto);
    }
    
    /**
     * Get unread notification count
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    /**
     * Mark notification as read
     */
    @Transactional
    public NotificationDto markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user");
        }
        
        notification.setStatus(NotificationStatus.READ);
        notification = notificationRepository.save(notification);
        
        return convertToDto(notification);
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public int markAllAsRead(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        return notificationRepository.markAllAsReadByUser(
            user, 
            NotificationStatus.READ, 
            NotificationStatus.UNREAD,
            LocalDateTime.now()
        );
    }
    
    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user");
        }
        
        notificationRepository.delete(notification);
    }
    
    /**
     * Delete all notifications for a user
     */
    @Transactional
    public void deleteAllNotifications(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
    }
    
    /**
     * Send WebSocket notification to a specific user
     */
    private void sendWebSocketNotification(UUID userId, NotificationDto notification) {
        try {
            // Send to user-specific queue
            String destination = "/user/" + userId + "/queue/notifications";
            messagingTemplate.convertAndSend(destination, notification);
            log.debug("WebSocket notification sent to: {}", destination);
        } catch (Exception e) {
            log.error("Error sending WebSocket notification to user {}: {}", userId, e.getMessage());
        }
    }
    
    /**
     * Convert Notification entity to DTO
     */
    private NotificationDto convertToDto(Notification notification) {
        return NotificationDto.builder()
            .id(notification.getId())
            .userId(notification.getUser().getId())
            .type(notification.getType())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .status(notification.getStatus())
            .referenceId(notification.getReferenceId())
            .referenceType(notification.getReferenceType())
            .metadata(notification.getMetadata())
            .imageUrl(notification.getImageUrl())
            .deepLink(notification.getDeepLink())
            .createdAt(notification.getCreatedAt())
            .updatedAt(notification.getUpdatedAt())
            .build();
    }
    
    /**
     * Cleanup old notifications (can be scheduled)
     */
    @Transactional
    public int cleanupOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        return notificationRepository.deleteOldNotifications(cutoffDate);
    }
}
