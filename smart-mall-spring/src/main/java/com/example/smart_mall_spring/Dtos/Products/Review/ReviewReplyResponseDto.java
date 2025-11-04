package com.example.smart_mall_spring.Dtos.Products.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReplyResponseDto {
    private String id;
    private String shopId;
    private UUID replyId;
    private String shopName;
    private String replyContent;
    private LocalDateTime repliedAt;
}