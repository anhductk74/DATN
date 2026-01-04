package com.example.smart_mall_spring.Services;

import com.example.smart_mall_spring.Dtos.WebSocket.DeliveryMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliverySocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyShipper(UUID shipperId, DeliveryMessage message) {
        log.info("🚀 [WS] Sending to shipper queue: /queue/shipper/{}", shipperId);
        log.info("📦 [WS] Payload = {}", message);
        messagingTemplate.convertAndSend(
                "/queue/shipper/" + shipperId,
                message
        );
    }

    public void notifyManager(DeliveryMessage message) {
        log.info("🚀 [WS] Sending to manager topic");
        log.info("📦 [WS] Payload = {}", message);
        messagingTemplate.convertAndSend(
                "/topic/subshipment-status",
                message
        );
    }
}