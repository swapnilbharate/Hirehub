package com.hirehub.service;

import com.hirehub.entity.Notification;
import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String message);
    List<Notification> getNotificationsForUser(String email);
    Notification markAsRead(Long notificationId);
    void markAllAsRead(String email);
}
