package com.example.smart_mall_spring.Entities.Users;
import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Orders.Voucher;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserVoucher extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user; // Người sưu tầm voucher

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    @JsonIgnore
    private Voucher voucher; // Voucher được sưu tầm

    private Boolean used = false; // true nếu user đã dùng voucher này

    private LocalDateTime collectedAt = LocalDateTime.now(); // thời gian sưu tầm

    private LocalDateTime usedAt; // thời gian đã sử dụng (nếu có)
}