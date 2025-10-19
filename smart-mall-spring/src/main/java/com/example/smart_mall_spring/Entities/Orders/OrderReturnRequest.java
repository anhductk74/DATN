package com.example.smart_mall_spring.Entities.Orders;


import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Enum.ReturnStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_return_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReturnRequest extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String reason; // Lý do yêu cầu hoàn trả

    @Enumerated(EnumType.STRING)
    private ReturnStatus status;

    private LocalDateTime requestDate;
    private LocalDateTime processedDate;

    @OneToMany(mappedBy = "orderReturnRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderReturnImage> images = new ArrayList<>();
}