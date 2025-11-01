package com.example.smart_mall_spring.Services.Products;

import com.example.smart_mall_spring.Dtos.Products.Review.*;
import com.example.smart_mall_spring.Entities.Products.Review;
import com.example.smart_mall_spring.Entities.Products.ReviewReply;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Repositories.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewReplyService {

    private final ReviewReplyRepository reviewReplyRepository;
    private final ReviewRepository reviewRepository;
    private final ShopRepository shopRepository;


    public ReviewReplyResponseDto createReply(ReviewReplyRequestDto dto) {
        UUID reviewId = UUID.fromString(dto.getReviewId());
        UUID shopId = UUID.fromString(dto.getShopId());

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy review."));
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shop."));

        // Kiểm tra shop đã trả lời chưa
        if (reviewReplyRepository.existsByReviewIdAndShopId(reviewId, shopId)) {
            throw new IllegalStateException("Shop đã phản hồi review này rồi.");
        }

        ReviewReply reply = new ReviewReply();
        reply.setReview(review);
        reply.setShop(shop);
        reply.setReplyContent(dto.getReplyContent());
        reply.setRepliedAt(LocalDateTime.now());

        ReviewReply saved = reviewReplyRepository.save(reply);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public ReviewReplyResponseDto getReplyByReview(UUID reviewId) {
        ReviewReply reply = reviewReplyRepository.findByReviewId(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review chưa có phản hồi."));
        return mapToResponseDto(reply);
    }


    @Transactional(readOnly = true)
    public List<ReviewReplyResponseDto> getRepliesByShop(UUID shopId, Pageable pageable) {
        List<ReviewReply> replies = reviewReplyRepository.findByShopId(shopId, pageable);
        return replies.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }


    public void deleteReplyByReview(UUID reviewId) {
        reviewReplyRepository.deleteByReviewId(reviewId);
    }
    public ReviewReplyResponseDto updateReply(ReviewReplyRequestDto dto) {
        UUID reviewId = UUID.fromString(dto.getReviewId());
        UUID shopId = UUID.fromString(dto.getShopId());

        ReviewReply reply = reviewReplyRepository.findByReviewIdAndShopId(reviewId, shopId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phản hồi để cập nhật."));

        reply.setReplyContent(dto.getReplyContent());
        reply.setRepliedAt(LocalDateTime.now());

        ReviewReply updated = reviewReplyRepository.save(reply);
        return mapToResponseDto(updated);
    }

    // -------------------
    // Helper mapper
    // -------------------
    private ReviewReplyResponseDto mapToResponseDto(ReviewReply reply) {
        return new ReviewReplyResponseDto(
                reply.getId().toString(),
                reply.getShop().getId().toString(),
                reply.getShop().getName(),
                reply.getReplyContent(),
                reply.getRepliedAt()
        );
    }
}
