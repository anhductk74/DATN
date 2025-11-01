package com.example.smart_mall_spring.Entities.Products;
import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Shop;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "review_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReply extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    private String replyContent;
    private LocalDateTime repliedAt;
}
