package com.example.smart_mall_spring.Dtos.WebSocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryMessage {

    private String type;        // ASSIGNED, STATUS_UPDATE
    private UUID subShipmentId;
    private UUID shipmentOrderId; // manager cần
    private UUID shipperId;     // shipper cần
    private String status;
    private String message;
}