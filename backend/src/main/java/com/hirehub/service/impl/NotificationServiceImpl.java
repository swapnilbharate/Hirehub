package com.hirehub.service.impl;

import com.hirehub.entity.Notification;
import com.hirehub.entity.User;
import com.hirehub.exception.ResourceNotFoundException;
import com.hirehub.repository.NotificationRepository;
import com.hirehub.repository.UserRepository;
import com.hirehub.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Notification createNotification(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        Notification notification = new Notification(user, message);
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        for (Notification n : notifications) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
}
