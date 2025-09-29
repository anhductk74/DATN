package com.example.smart_mall_spring.Entities.Orders;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserAddress;
import com.example.smart_mall_spring.Enum.PaymentMethod;
import com.example.smart_mall_spring.Enum.StatusOrder;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Order extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private StatusOrder status;

    private Double totalAmount;

    @ManyToOne
    @JoinColumn(name = "shipping_address_id", nullable = false)
    private UserAddress shippingAddress;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @OneToMany(mappedBy = "order")
    private List<OrderItem> items;
}
