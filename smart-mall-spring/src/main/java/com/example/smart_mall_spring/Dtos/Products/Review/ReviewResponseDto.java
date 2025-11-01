package com.example.smart_mall_spring.Dtos.Products.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private String id;
    private Integer rating;
    private String comment;
    private Boolean isEdited;
    private LocalDateTime reviewedAt;

    private String userId;
    private String userName;
    private String userAvatar;

    private String productId;
    private String productName;

    // Danh sách media (ảnh/video)
    private List<ReviewMediaResponseDto> mediaList;

    // Phản hồi của shop (nếu có)
    private ReviewReplyResponseDto shopReply;
}