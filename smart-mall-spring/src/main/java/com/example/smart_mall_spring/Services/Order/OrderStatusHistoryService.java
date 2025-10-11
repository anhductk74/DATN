package com.example.smart_mall_spring.Services.Order;

import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Orders.OrderStatusHistory;
import com.example.smart_mall_spring.Enum.StatusOrder;
import com.example.smart_mall_spring.Repositories.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderStatusHistoryService {

    private final OrderStatusHistoryRepository historyRepository;

    //  Lưu lại lịch sử khi trạng thái thay đổi
    public void recordStatusChange(Order order, StatusOrder fromStatus, StatusOrder toStatus, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setNote(note);
        history.setChangedAt(LocalDateTime.now());

        historyRepository.save(history);
    }

    //  Lấy toàn bộ lịch sử theo đơn hàng
    public List<OrderStatusHistory> getHistoryByOrder(Order order) {
        return historyRepository.findByOrderOrderByChangedAtAsc(order);
    }
}