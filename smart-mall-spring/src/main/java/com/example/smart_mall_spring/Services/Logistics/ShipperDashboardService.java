package com.example.smart_mall_spring.Services.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.ShipperDashboardResponseDto;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperTransactionRepository;
import com.example.smart_mall_spring.Repositories.Logistics.SubShipmentOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipperDashboardService {

    private final SubShipmentOrderRepository subRepo;

    private final ShipperTransactionService transService;

    public ShipperDashboardResponseDto getDashboard(UUID shipperId) {

        // --- Today summary ---
        long totalAssigned = subRepo.countAssignedToday(shipperId);
        long delivered = subRepo.countDeliveredToday(shipperId);
        long inTransit = subRepo.countInTransitToday(shipperId);
        long pending = subRepo.countPendingToday(shipperId);

        var today = new ShipperDashboardResponseDto.TodaySummary(
                totalAssigned, delivered, inTransit, pending
        );

        // --- COD summary using transactionService ---
        Map<String, BigDecimal> revenueSummary = transService.getRevenueSummary(shipperId);
        var cod = new ShipperDashboardResponseDto.CodSummary(
                revenueSummary.get("totalCollected"),
                revenueSummary.get("totalPaid"),
                revenueSummary.get("codBalance"),
                revenueSummary.get("totalBonus"),
                revenueSummary.get("netIncome")
        );


        // --- Recent deliveries (limit 5) ---
        Pageable limit = PageRequest.of(0, 5);
        var recent = subRepo.findRecentDeliveries(shipperId, limit);

        return new ShipperDashboardResponseDto(today, cod, recent);
    }
}