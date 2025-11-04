package com.example.smart_mall_spring.Services.Products;

import com.example.smart_mall_spring.Dtos.Products.Review.*;
import com.example.smart_mall_spring.Entities.Orders.Order;
import com.example.smart_mall_spring.Entities.Products.*;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Repositories.*;
import com.example.smart_mall_spring.Services.CloudinaryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMediaRepository reviewMediaRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Tạo review mới
     */
    public ReviewResponseDto createReview(ReviewRequestDto dto) {
        UUID userId = UUID.fromString(dto.getUserId());
        UUID productId = UUID.fromString(dto.getProductId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        Order order = null;
        if (dto.getOrderId() != null) {
            order = orderRepository.findById(UUID.fromString(dto.getOrderId()))
                    .orElse(null);
        }

        // Kiểm tra nếu user đã review product này
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalStateException("Bạn đã đánh giá sản phẩm này rồi.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setOrder(order);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        // Lưu danh sách media (nếu có)
        if (dto.getImageUrls() != null) {
            for (String imageUrl : dto.getImageUrls()) {
                ReviewMedia media = new ReviewMedia(saved, imageUrl, "IMAGE");
                reviewMediaRepository.save(media);
            }
        }
        if (dto.getVideoUrls() != null) {
            for (String videoUrl : dto.getVideoUrls()) {
                ReviewMedia media = new ReviewMedia(saved, videoUrl, "VIDEO");
                reviewMediaRepository.save(media);
            }
        }

        return mapToResponseDto(saved);
    }

    /**
     * Lấy danh sách review theo sản phẩm (phân trang)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getReviewsByProduct(UUID productId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByProductId(productId, pageable);
        return reviews.map(this::mapToResponseDto);
    }

    /**
     * Lấy chi tiết review theo ID
     */
    @Transactional(readOnly = true)
    public ReviewResponseDto getReviewById(UUID reviewId) {
        Review review = reviewRepository.findByIdWithMedia(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy review"));
        return mapToResponseDto(review);
    }

    /**
     * Xóa review (và media đi kèm)
     */
    public void deleteReview(UUID reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new EntityNotFoundException("Không tìm thấy review để xóa");
        }
        reviewMediaRepository.deleteByReviewId(reviewId);
        reviewRepository.deleteByIdCustom(reviewId);
    }

    @Transactional(readOnly = true)
    public ReviewStatisticsDto getReviewStatistics(UUID productId) {
        // Lấy trung bình và tổng số lượt đánh giá
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        Long total = reviewRepository.countByProductId(productId);

        // Đếm theo từng mức sao
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Long count = reviewRepository.countByProductIdAndRating(productId, i);
            ratingCounts.put(i, count);
        }

        return new ReviewStatisticsDto(avg, total, ratingCounts);
    }
    public ReviewResponseDto findByUserAndProduct(UUID userId, UUID productId) {
        Optional<Review> reviewOpt = reviewRepository.findByUserIdAndProductId(userId, productId);
        return reviewOpt.map(this::mapToResponseDto).orElse(null);
    }


    // -----------------------
    // 🔄 Helper mapping
    // -----------------------

    private ReviewResponseDto mapToResponseDto(Review review) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(review.getId().toString());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setIsEdited(review.getIsEdited());
        dto.setReviewedAt(review.getReviewedAt());

        dto.setUserId(review.getUser().getId().toString());
        dto.setUserName(review.getUser().getProfile().getFullName());
        dto.setUserAvatar(review.getUser().getProfile().getAvatar());

        dto.setProductId(review.getProduct().getId().toString());
        dto.setProductName(review.getProduct().getName());

        List<ReviewMediaResponseDto> mediaList = reviewMediaRepository.findByReviewId(review.getId())
                .stream()
                .map(m -> new ReviewMediaResponseDto(
                        m.getId().toString(),
                        m.getMediaUrl(),
                        m.getMediaType()
                ))
                .collect(Collectors.toList());
        dto.setMediaList(mediaList);

        Optional<ReviewReply> replyOpt = reviewReplyRepository.findByReviewId(review.getId());
        replyOpt.ifPresent(reply -> {
            ReviewReplyResponseDto replyDto = new ReviewReplyResponseDto(
                    reply.getId().toString(),
                    reply.getShop().getId().toString(),
                    reply.getReview().getId(),
                    reply.getShop().getName(),
                    reply.getReplyContent(),
                    reply.getRepliedAt()
            );
            dto.setShopReply(replyDto);
        });

        return dto;
    }
    public ReviewResponseDto createReviewWithMedia(ReviewRequestDto dto, MultipartFile[] imageFiles, MultipartFile[] videoFiles) {
        UUID userId = UUID.fromString(dto.getUserId());
        UUID productId = UUID.fromString(dto.getProductId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        Order order = null;
        if (dto.getOrderId() != null) {
            order = orderRepository.findById(UUID.fromString(dto.getOrderId()))
                    .orElse(null);
        }

        boolean hasReviewed;

        if (order != null) {
            hasReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(userId, productId, order.getId());
        } else {
            hasReviewed = reviewRepository.existsByUserIdAndProductId(userId, productId);
        }

        if (hasReviewed) {
            throw new IllegalStateException("Bạn đã đánh giá sản phẩm này rồi.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setOrder(order);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        // 🟡 Upload ảnh lên Cloudinary (nếu có)
        if (imageFiles != null && imageFiles.length > 0) {
            for (MultipartFile file : imageFiles) {
                Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(file, "reviews/images");
                String url = uploadResult.get("url"); // service của bạn trả path rút gọn
                ReviewMedia media = new ReviewMedia(saved, url, "IMAGE");
                reviewMediaRepository.save(media);
            }
        }
        // upload videos
        if (videoFiles != null && videoFiles.length > 0) {
            for (MultipartFile file : videoFiles) {
                Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(file, "reviews/videos");
                String url = uploadResult.get("url");
                ReviewMedia media = new ReviewMedia(saved, url, "VIDEO");
                reviewMediaRepository.save(media);
            }
        }

        return mapToResponseDto(saved);
    }
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getReviewsByShop(
            UUID shopId,
            int page,
            int size,
            Integer rating,
            Boolean hasReply,
            UUID productId,
            String sortBy,
            String sortDirection
    ) {
        Pageable pageable = PageRequest.of(page, size,
                sortDirection.equalsIgnoreCase("asc") ?
                        Sort.by(sortBy).ascending() :
                        Sort.by(sortBy).descending()
        );

        Page<Review> reviews = reviewRepository.findByShopWithFilters(
                shopId, rating, hasReply, productId, pageable
        );

        return reviews.map(this::mapToResponseDto);
    }
    @Transactional(readOnly = true)
    public ShopReviewStatisticsDto getShopReviewStatistics(UUID shopId) {
        Long totalReviews = reviewRepository.countByShopId(shopId);
        Double averageRating = reviewRepository.getAverageRatingByShopId(shopId);

        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, reviewRepository.countByShopIdAndRating(shopId, i));
        }

        Long repliedCount = reviewRepository.countByShopIdWithReply(shopId);
        Long pendingReplyCount = totalReviews - repliedCount;

        // Có thể thêm biểu đồ xu hướng tháng
        List<Object[]> rawStats = reviewRepository.getMonthlyReviewTrendByShop(shopId);
        List<MonthlyReviewStats> monthlyTrend = rawStats.stream()
                .map(row -> new MonthlyReviewStats(
                        (String) row[0],                  // yearMonth
                        ((Number) row[1]).longValue(),    // totalReviews
                        ((Number) row[2]).doubleValue()   // averageRating
                ))
                .collect(Collectors.toList());
        return new ShopReviewStatisticsDto(
                totalReviews,
                averageRating,
                ratingCounts,
                repliedCount,
                pendingReplyCount,
                monthlyTrend
        );
    }
    @Transactional(readOnly = true)
    public List<ProductReviewSummaryDto> getShopProductsWithReviewSummary(UUID shopId) {
        // Lấy danh sách sản phẩm theo shop
        List<Product> products = productRepository.findByShopId(shopId);

        // Duyệt và map từng sản phẩm sang DTO tổng hợp đánh giá
        return products.stream()
                .filter(product -> !product.getIsDeleted()) // nếu có cờ xóa mềm thì lọc ra luôn
                .map(product -> {
                    UUID productId = product.getId();
                    Long totalReviews = reviewRepository.countByProductId(productId);
                    Double avgRating = reviewRepository.getAverageRatingByProductId(productId);

                    Map<Integer, Long> ratingCounts = new HashMap<>();
                    for (int i = 1; i <= 5; i++) {
                        ratingCounts.put(i, reviewRepository.countByProductIdAndRating(productId, i));
                    }

                    Optional<Review> latestReview = reviewRepository.findTopByProductIdOrderByReviewedAtDesc(productId);

                    return new ProductReviewSummaryDto(
                            productId.toString(),
                            product.getName(),
                            (product.getImages() != null && !product.getImages().isEmpty())
                                    ? product.getImages().get(0)
                                    : null, // lấy ảnh đầu tiên làm thumbnail
                            totalReviews,
                            avgRating,
                            ratingCounts,
                            latestReview.map(this::mapToResponseDto).orElse(null)
                    );

                })
                .collect(Collectors.toList());
    }

}
