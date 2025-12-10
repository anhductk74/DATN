package com.example.smart_mall_spring.Services.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.ShipperBalanceHistory.ShipperBalanceHistoryRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipperBalanceHistory.ShipperBalanceHistoryResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Entities.Logistics.ShipperBalanceHistory;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperBalanceHistoryRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperTransactionRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipperBalanceHistoryService {

    private final ShipperBalanceHistoryRepository historyRepo;
    private final ShipperRepository shipperRepo;
    private final ShipperTransactionRepository transactionRepo;

    // ---------------------------------------------------------
    // Mapping
    // ---------------------------------------------------------
    private ShipperBalanceHistoryResponseDto toResponse(ShipperBalanceHistory h) {
        return ShipperBalanceHistoryResponseDto.builder()
                .id(h.getId())
                .shipperId(h.getShipper().getId())
                .shipperName(h.getShipper() != null && h.getShipper().getUser() != null && h.getShipper().getUser().getProfile() != null 
                    ? h.getShipper().getUser().getProfile().getFullName() : null)
                .openingBalance(h.getOpeningBalance())
                .collected(h.getCollected())
                .deposited(h.getDeposited())
                .bonus(h.getBonus())
                .finalBalance(h.getFinalBalance())
                .date(h.getDate())
                .build();
    }

    // ---------------------------------------------------------
    // CREATE DAILY BALANCE
    // ---------------------------------------------------------
    public ShipperBalanceHistoryResponseDto createDailyHistory(ShipperBalanceHistoryRequestDto request) {

        UUID shipperId = request.getShipperId();
        Shipper shipper = shipperRepo.findById(shipperId)
                .orElseThrow(() -> new EntityNotFoundException("Shipper không tồn tại: " + shipperId));

        UUID companyId = shipper.getShippingCompany() != null ? shipper.getShippingCompany().getId() : null;
        if (companyId == null) {
            throw new EntityNotFoundException("Shipper chưa gán công ty: " + shipperId);
        }

        LocalDate today = LocalDate.now();

        // Lấy giao dịch trong ngày theo công ty
        BigDecimal collected = transactionRepo.sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.COLLECT_COD, today, companyId);
        BigDecimal deposited = transactionRepo.sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.DEPOSIT_COD, today, companyId);
        BigDecimal bonus = transactionRepo.sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.BONUS, today, companyId);

        // Lấy số dư hôm qua (openingBalance)
        BigDecimal openingBalance = BigDecimal.ZERO;
        List<ShipperBalanceHistory> old = historyRepo.findByShipperId(shipperId);
        if (!old.isEmpty()) {
            openingBalance = old.get(old.size() - 1).getFinalBalance();
        }

        BigDecimal finalBalance = openingBalance.add(collected).subtract(bonus).subtract(deposited);

        ShipperBalanceHistory history = new ShipperBalanceHistory();
        history.setShipper(shipper);
        history.setOpeningBalance(openingBalance);
        history.setCollected(collected);
        history.setDeposited(deposited);
        history.setBonus(bonus);
        history.setFinalBalance(finalBalance);
        history.setDate(LocalDateTime.now());

        historyRepo.save(history);

        return toResponse(history);
    }


    // ---------------------------------------------------------
    // GET ALL BY SHIPPER
    // ---------------------------------------------------------
    public List<ShipperBalanceHistoryResponseDto> getByShipper(UUID shipperId) {
        return historyRepo.findByShipperId(shipperId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // GET DAILY RANGE
    // ---------------------------------------------------------
    public List<ShipperBalanceHistoryResponseDto> getByDate(LocalDate date) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        return historyRepo.findByDateBetween(start, end)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ShipperBalanceHistoryResponseDto getDetail(UUID id) {
        ShipperBalanceHistory h = historyRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy record: " + id));

        return toResponse(h);
    }

    public Page<ShipperBalanceHistoryResponseDto> getPagedHistory(UUID shipperId, int page, int size) {

        PageRequest pr = PageRequest.of(page, size);

        return historyRepo.findByShipperId(shipperId, pr)
                .map(this::toResponse);
    }
    public List<ShipperBalanceHistoryResponseDto> getHistoryRange(
            LocalDate from,
            LocalDate to,
            UUID shipperId,
            UUID companyId
    ) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(23, 59, 59);

        List<ShipperBalanceHistory> list;

        if (shipperId != null) {
            // Ưu tiên lọc theo shipper
            list = historyRepo.findByShipperIdAndDateBetween(shipperId, start, end);
        } else if (companyId != null) {
            // Lọc theo công ty
            list = historyRepo.findByShipper_ShippingCompany_IdAndDateBetween(companyId, start, end);
        } else {
            // Lấy tất cả
            list = historyRepo.findByDateBetween(start, end);
        }

        return list.stream()
                .map(this::toResponse)
                .toList();
    }


}
