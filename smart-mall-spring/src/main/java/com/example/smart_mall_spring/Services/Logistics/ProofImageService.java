package com.example.smart_mall_spring.Services.Logistics;
import com.example.smart_mall_spring.Entities.Logistics.ProofImage;
import com.example.smart_mall_spring.Entities.Logistics.SubShipmentOrder;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Repositories.Logistics.ProofImageRepository;
import com.example.smart_mall_spring.Repositories.Logistics.SubShipmentOrderRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProofImageService {

    private final CloudinaryService cloudinaryService;
    private final ProofImageRepository proofImageRepository;
    private final SubShipmentOrderRepository subShipmentOrderRepository;

    public ProofImage uploadProofImage(String trackingCode, MultipartFile file) {

        SubShipmentOrder sub =
                getDeliveredSubByTrackingCode(trackingCode);


        Map<String, String> upload =
                cloudinaryService.uploadFileToFolder(file, "proof");

        ProofImage img = ProofImage.builder()
                .url(upload.get("url"))
                .publicId(upload.get("publicId"))
                .subShipmentOrder(sub)
                .createdAt(LocalDateTime.now())
                .build();

        return proofImageRepository.save(img);
    }

    public List<ProofImage> getProofImages(String trackingCode) {

        SubShipmentOrder sub =
                getDeliveredSubByTrackingCode(trackingCode);


        return proofImageRepository.findBySubShipmentOrderId(sub.getId());
    }

    private SubShipmentOrder getDeliveredSubByTrackingCode(String code) {

        List<SubShipmentOrder> subs =
                subShipmentOrderRepository.findAllByTrackingCodeSuffix(code);

        if (subs.isEmpty()) {
            throw new EntityNotFoundException("Không tìm thấy đơn với mã: " + code);
        }

        return subs.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException("Chưa có chặng nào DELIVERED để upload minh chứng"));
    }

}