package com.example.smart_mall_spring.Controllers;
import com.example.smart_mall_spring.Dtos.Products.Review.*;
import com.example.smart_mall_spring.Services.Products.ReviewReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/review-replies")
@RequiredArgsConstructor
public class ReviewReplyController {

    private final ReviewReplyService reviewReplyService;


    @PostMapping
    public ResponseEntity<ReviewReplyResponseDto> createReply(@RequestBody ReviewReplyRequestDto dto) {
        ReviewReplyResponseDto reply = reviewReplyService.createReply(dto);
        return ResponseEntity.ok(reply);
    }
    @PutMapping
    public ResponseEntity<ReviewReplyResponseDto> updateReply(@RequestBody ReviewReplyRequestDto dto) {
        return ResponseEntity.ok(reviewReplyService.updateReply(dto));
    }

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<ReviewReplyResponseDto> getReplyByReview(@PathVariable UUID reviewId) {
        ReviewReplyResponseDto reply = reviewReplyService.getReplyByReview(reviewId);
        return ResponseEntity.ok(reply);
    }


    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ReviewReplyResponseDto>> getRepliesByShop(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        List<ReviewReplyResponseDto> replies = reviewReplyService.getRepliesByShop(shopId, pageable);
        return ResponseEntity.ok(replies);
    }


    @DeleteMapping("/review/{reviewId}")
    public ResponseEntity<Void> deleteReply(@PathVariable UUID reviewId) {
        reviewReplyService.deleteReplyByReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
