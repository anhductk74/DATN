package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Notification;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    /**
     * Find all notifications for a specific user with pagination
     */
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    /**
     * Find all notifications for a specific user by status
     */
    Page<Notification> findByUserAndStatusOrderByCreatedAtDesc(
        User user, 
        NotificationStatus status, 
        Pageable pageable
    );
    
    /**
     * Count unread notifications for a user
     */
    long countByUserAndStatus(User user, NotificationStatus status);
    
    /**
     * Find notifications by user ID
     */
    List<Notification> findByUser_IdOrderByCreatedAtDesc(UUID userId);
    
    /**
     * Mark all notifications as read for a user
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.updatedAt = :updatedAt WHERE n.user = :user AND n.status = :oldStatus")
    int markAllAsReadByUser(
        @Param("user") User user,
        @Param("status") NotificationStatus status,
        @Param("oldStatus") NotificationStatus oldStatus,
        @Param("updatedAt") LocalDateTime updatedAt
    );
    
    /**
     * Delete old notifications (cleanup)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate")
    int deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);
    
    /**
     * Get recent unread notifications count by user
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.status = 'UNREAD'")
    long countUnreadByUserId(@Param("userId") UUID userId);
}
