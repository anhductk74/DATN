package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Config.CustomUserDetails;
import com.example.smart_mall_spring.Dtos.Notification.NotificationDto;
import com.example.smart_mall_spring.Dtos.Notification.NotificationRequestDto;
import com.example.smart_mall_spring.Services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for notification management
 * Provides endpoints for fetching, marking as read, and deleting notifications
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Get all notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        UUID userId = userDetails.getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDto> notifications = notificationService.getUserNotifications(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notifications retrieved successfully");
        response.put("data", Map.of(
            "content", notifications.getContent(),
            "totalElements", notifications.getTotalElements(),
            "totalPages", notifications.getTotalPages(),
            "currentPage", notifications.getNumber(),
            "pageSize", notifications.getSize(),
            "hasNext", notifications.hasNext(),
            "hasPrevious", notifications.hasPrevious()
        ));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get unread notifications for the authenticated user
     */
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        UUID userId = userDetails.getId();
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDto> notifications = notificationService.getUnreadNotifications(userId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Unread notifications retrieved successfully");
        response.put("data", Map.of(
            "content", notifications.getContent(),
            "totalElements", notifications.getTotalElements(),
            "totalPages", notifications.getTotalPages(),
            "currentPage", notifications.getNumber(),
            "pageSize", notifications.getSize()
        ));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get unread notification count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID userId = userDetails.getId();
        long count = notificationService.getUnreadCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Unread count retrieved successfully");
        response.put("data", Map.of("count", count));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID userId = userDetails.getId();
        NotificationDto notification = notificationService.markAsRead(notificationId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification marked as read");
        response.put("data", notification);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID userId = userDetails.getId();
        int updatedCount = notificationService.markAllAsRead(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("updatedCount", updatedCount);
        response.put("message", "All notifications marked as read");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID userId = userDetails.getId();
        notificationService.deleteNotification(notificationId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification deleted successfully");
        response.put("data", null);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete all notifications
     */
    @DeleteMapping("/all")
    public ResponseEntity<Map<String, Object>> deleteAllNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID userId = userDetails.getId();
        notificationService.deleteAllNotifications(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications deleted successfully");
        response.put("data", null);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Admin: Create a notification manually
     */
    @PostMapping("/admin/create")
    public ResponseEntity<Map<String, Object>> createNotification(
            @Valid @RequestBody NotificationRequestDto requestDto) {
        
        notificationService.createAndSendNotification(requestDto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification created and sent successfully");
        response.put("data", null);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
