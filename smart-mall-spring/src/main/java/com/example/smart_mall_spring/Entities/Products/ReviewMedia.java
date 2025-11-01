package com.example.smart_mall_spring.Entities.Products;

import com.example.smart_mall_spring.Entities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "review_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ReviewMedia extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    private String mediaUrl;   // URL ảnh/video lưu trên Cloudinary
    private String mediaType;  // IMAGE hoặc VIDEO
}