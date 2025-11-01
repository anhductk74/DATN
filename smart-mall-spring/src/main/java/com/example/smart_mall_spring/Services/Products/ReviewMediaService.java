//package com.example.smart_mall_spring.Services.Products;
//
//import com.cloudinary.Cloudinary;
//import com.cloudinary.utils.ObjectUtils;
//import com.example.smart_mall_spring.Dtos.Products.Review.ReviewMediaResponseDto;
//import com.example.smart_mall_spring.Entities.Products.Review;
//import com.example.smart_mall_spring.Entities.Products.ReviewMedia;
//import com.example.smart_mall_spring.Repositories.ReviewMediaRepository;
//import com.example.smart_mall_spring.Repositories.ReviewRepository;
//import jakarta.transaction.Transactional;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class ReviewMediaService {
//
//    private final ReviewMediaRepository reviewMediaRepository;
//    private final ReviewRepository reviewRepository;
//    private final Cloudinary cloudinary;
//
//    /**
//     * Upload danh sách media (ảnh/video) cho một review.
//     */
//    @Transactional
//    public List<ReviewMediaResponseDto> uploadReviewMedia(UUID reviewId, List<MultipartFile> files) throws IOException {
//        Review review = reviewRepository.findById(reviewId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy review với ID: " + reviewId));
//
//        List<ReviewMediaResponseDto> uploadedFiles = new ArrayList<>();
//
//        for (MultipartFile file : files) {
//            // Upload lên Cloudinary
//            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
//                    "resource_type", "auto" // Cho phép upload cả video
//            ));
//
//            String url = (String) uploadResult.get("secure_url");
//            String format = (String) uploadResult.get("resource_type");
//
//            // Tạo và lưu vào DB
//            ReviewMedia media = new ReviewMedia();
//            media.setReview(review);
//            media.setMediaUrl(url);
//            media.setMediaType(format.toUpperCase());
//            ReviewMedia saved = reviewMediaRepository.save(media);
//
//            uploadedFiles.add(new ReviewMediaResponseDto(
//                    saved.getId().toString(),
//                    saved.getMediaUrl(),
//                    saved.getMediaType()
//            ));
//        }
//
//        return uploadedFiles;
//    }
//
//    /**
//     * Lấy tất cả media của 1 review.
//     */
//    public List<ReviewMediaResponseDto> getMediaByReview(UUID reviewId) {
//        return reviewMediaRepository.findByReviewId(reviewId)
//                .stream()
//                .map(media -> new ReviewMediaResponseDto(
//                        media.getId().toString(),
//                        media.getMediaUrl(),
//                        media.getMediaType()
//                ))
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Xóa toàn bộ media của review.
//     */
//    @Transactional
//    public void deleteMediaByReview(UUID reviewId) {
//        reviewMediaRepository.deleteByReviewId(reviewId);
//    }
//}
