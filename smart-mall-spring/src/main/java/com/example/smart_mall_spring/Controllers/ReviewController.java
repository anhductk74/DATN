package com.example.smart_mall_spring.Controllers;

import com.example.smart_mall_spring.Dtos.Products.Review.*;
import com.example.smart_mall_spring.Services.Products.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewResponseDto> createReview(
            @RequestParam("userId") String userId,
            @RequestParam("productId") String productId,
            @RequestParam(value = "orderId", required = false) String orderId,
            @RequestParam("rating") Integer rating,
            @RequestParam("comment") String comment,
            @RequestParam(value = "imageUrls", required = false) MultipartFile[] imageFiles, // nhận mảng file
            @RequestParam(value = "videoUrls", required = false) MultipartFile[] videoFiles
    ) {
        ReviewRequestDto dto = new ReviewRequestDto();
        dto.setUserId(userId);
        dto.setProductId(productId);
        dto.setOrderId(orderId);
        dto.setRating(rating);
        dto.setComment(comment);

        ReviewResponseDto response = reviewService.createReviewWithMedia(dto, imageFiles, videoFiles);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponseDto>> getReviewsByProduct(
            @PathVariable UUID productId,
            Pageable pageable
    ) {
        Page<ReviewResponseDto> result = reviewService.getReviewsByProduct(productId, pageable);
        return ResponseEntity.ok(result);
    }



    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> getReviewById(@PathVariable UUID reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/product/{productId}/statistics")
    public ResponseEntity<ReviewStatisticsDto> getReviewStatistics(@PathVariable UUID productId) {
        ReviewStatisticsDto stats = reviewService.getReviewStatistics(productId);
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<ReviewResponseDto> checkUserReview(
            @PathVariable UUID userId,
            @PathVariable UUID productId
    ) {
        ReviewResponseDto review = reviewService.findByUserAndProduct(userId, productId);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }


    /**  Kiểm tra review của user với product */
//    @GetMapping("/user/{userId}/product/{productId}")
//    public ResponseEntity<ReviewResponseDto> findByUserAndProduct(
//            @PathVariable UUID userId,
//            @PathVariable UUID productId
//    ) {
//        return ResponseEntity.ok(reviewService.findByUserAndProduct(userId, productId));
//    }

    /**  Lấy danh sách review của shop (có filter, sort, paginate) */
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<Page<ReviewResponseDto>> getReviewsForShop(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean hasReply,
            @RequestParam(required = false) UUID productId,
            @RequestParam(defaultValue = "reviewedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByShop(
                shopId, page, size, rating, hasReply, productId, sortBy, sortDirection
        ));
    }
    /**  Lấy thống kê review tổng hợp của shop */
    @GetMapping("/shop/{shopId}/statistics")
    public ResponseEntity<ShopReviewStatisticsDto> getShopReviewStatistics(@PathVariable UUID shopId) {
        return ResponseEntity.ok(reviewService.getShopReviewStatistics(shopId));
    }

    /**  Lấy danh sách sản phẩm của shop kèm thống kê review */
    @GetMapping("/shop/{shopId}/products-summary")
    public ResponseEntity<List<ProductReviewSummaryDto>> getShopProductsWithReviewSummary(
            @PathVariable UUID shopId
    ) {
        return ResponseEntity.ok(reviewService.getShopProductsWithReviewSummary(shopId));
    }

}