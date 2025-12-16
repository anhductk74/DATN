package com.example.smart_mall_spring.Services.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation.CodReconciliationRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation.CodReconciliationResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation.CodReconciliationUpdateStatusDto;
import com.example.smart_mall_spring.Entities.Logistics.CodReconciliation;
import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Enum.ReconciliationStatus;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.example.smart_mall_spring.Repositories.Logistics.CodReconciliationRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperTransactionRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodReconciliationService {

    private final CodReconciliationRepository codReconciliationRepository;
    private final ShipperRepository shipperRepository;
    private final ShipperTransactionRepository shipperTransactionRepository;

    // ============================================================
    //  MAPPING
    // ============================================================

    private CodReconciliationResponseDto toResponse(CodReconciliation e) {
        return CodReconciliationResponseDto.builder()
                .id(e.getId())
                .shipperId(e.getShipper().getId())
                .shipperName(e.getShipper() != null && e.getShipper().getUser() != null && e.getShipper().getUser().getProfile() != null 
                    ? e.getShipper().getUser().getProfile().getFullName() : null)
                .totalCollected(e.getTotalCollected())
                .totalDeposited(e.getTotalDeposited())
                .difference(e.getDifference())
                .status(e.getStatus())
                .date(e.getDate())
                .build();
    }

    // ============================================================
    //  CREATE RECONCILIATION
    // ============================================================

    public CodReconciliationResponseDto create(CodReconciliationRequestDto request, UUID companyId) {

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        // Kiểm tra shipper
        Shipper shipper = shipperRepository.findById(request.getShipperId())
                .orElseThrow(() -> new EntityNotFoundException("Shipper không tồn tại: " + request.getShipperId()));

        // Tổng COD thu
        BigDecimal totalCollected =
                shipperTransactionRepository.sumByTypeAndShipperAndDate(
                        shipper.getId(),
                        ShipperTransactionType.COLLECT_COD,
                        date,
                        companyId
                );

        // Tổng COD nộp
        BigDecimal totalDeposited =
                shipperTransactionRepository.sumByTypeAndShipperAndDate(
                        shipper.getId(),
                        ShipperTransactionType.DEPOSIT_COD,
                        date,
                        companyId
                );

        BigDecimal difference = totalCollected.subtract(totalDeposited);

        CodReconciliation rec = new CodReconciliation();
        rec.setShipper(shipper);
        rec.setTotalCollected(totalCollected);
        rec.setTotalDeposited(totalDeposited);
        rec.setDifference(difference);
        rec.setStatus(ReconciliationStatus.PENDING);
        rec.setDate(date);

        codReconciliationRepository.save(rec);

        return toResponse(rec);
    }


    // ============================================================
    //  GET BY DATE
    // ============================================================

    public List<CodReconciliationResponseDto> getByDate(LocalDate date) {
        return codReconciliationRepository.findByDate(date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    //  UPDATE STATUS
    // ============================================================

    public CodReconciliationResponseDto updateStatus(UUID id, CodReconciliationUpdateStatusDto dto) {
        CodReconciliation rec = codReconciliationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bản đối soát: " + id));

        rec.setStatus(dto.getStatus());
        codReconciliationRepository.save(rec);

        return toResponse(rec);
    }

    public CodReconciliationResponseDto createByShipper(UUID shipperId, UUID companyId) {

        Shipper shipper = shipperRepository.findById(shipperId)
                .orElseThrow(() -> new EntityNotFoundException("Shipper không tồn tại"));

        LocalDate today = LocalDate.now();

        BigDecimal totalCollected = shipperTransactionRepository
                .sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.COLLECT_COD, today, companyId);

        BigDecimal totalDeposited = shipperTransactionRepository
                .sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.DEPOSIT_COD, today, companyId);

        CodReconciliation rec = new CodReconciliation();
        rec.setShipper(shipper);
        rec.setTotalCollected(totalCollected);
        rec.setTotalDeposited(totalDeposited);
        rec.setDifference(totalCollected.subtract(totalDeposited));
        rec.setStatus(ReconciliationStatus.PENDING);
        rec.setDate(today);

        CodReconciliation saved = codReconciliationRepository.save(rec);

        return toResponse(saved);
    }

    public CodReconciliationResponseDto complete(UUID id) {
        CodReconciliation rec = codReconciliationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đối soát"));

        rec.setStatus(ReconciliationStatus.DONE);

        codReconciliationRepository.save(rec);

        return toResponse(rec);
    }
}
