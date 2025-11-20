package com.example.smart_mall_spring.Enum;


import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public enum GhtkStatusMapper {
    PENDING("Đang xử lý", ShipmentStatus.PENDING),
    PICKING_UP("Đang lấy hàng", ShipmentStatus.PICKING_UP),
    IN_TRANSIT("Đang vận chuyển", ShipmentStatus.IN_TRANSIT),
    DELIVERED("Đã giao hàng", ShipmentStatus.DELIVERED),
    RETURNED("Hoàn hàng", ShipmentStatus.RETURNED),
    CANCELLED("Đã hủy", ShipmentStatus.CANCELLED);

    private final String ghtkText;
    @Getter
    private final ShipmentStatus shipmentStatus;

    private static final Map<String, GhtkStatusMapper> map = new HashMap<>();

    static {
        for (GhtkStatusMapper mapper : values()) {
            map.put(mapper.ghtkText.toLowerCase(), mapper);
        }
    }

    GhtkStatusMapper(String ghtkText, ShipmentStatus shipmentStatus) {
        this.ghtkText = ghtkText;
        this.shipmentStatus = shipmentStatus;
    }

    public static ShipmentStatus fromGhtkText(String text) {
        if (text == null) return ShipmentStatus.PENDING;
        GhtkStatusMapper mapper = map.get(text.toLowerCase());
        return mapper != null ? mapper.getShipmentStatus() : ShipmentStatus.PENDING;
    }
}