package com.example.smart_mall_spring.Entities.Orders;


import com.example.smart_mall_spring.Entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReturnImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String url;        // Đường dẫn Cloudinary rút gọn
    private String publicId;   // Để xóa ảnh khi cần

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_return_request_id", nullable = false)
    private OrderReturnRequest orderReturnRequest;
}