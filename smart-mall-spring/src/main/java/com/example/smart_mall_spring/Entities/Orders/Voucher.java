package com.example.smart_mall_spring.Entities.Orders;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Enum.DiscountType;
import com.example.smart_mall_spring.Enum.VoucherType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Voucher extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String code; // Mã giảm giá, ví dụ: "FREESHIP20"

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherType type; // SHOP, SYSTEM, SHIPPING...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENTAGE, FIXED_AMOUNT

    @Column(nullable = false)
    private Double discountValue; // ví dụ: 20% hoặc 50000 VNĐ

    private Double maxDiscountAmount; // nếu là % thì giới hạn giảm tối đa

    private Double minOrderValue; // đơn hàng tối thiểu để áp dụng

    private Integer usageLimit; // số lần sử dụng tối đa
    private Integer usedCount = 0; // đã dùng bao nhiêu lần

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private Shop shop; // nếu null → là voucher toàn sàn

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active = true;
}
