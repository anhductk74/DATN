package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.DashboardChartPointDto;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.DashboardResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.DashboardSummaryDto;
import com.example.smart_mall_spring.Dtos.Logistic.Dashboard.TopShipperDto;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.example.smart_mall_spring.Repositories.Logistics.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ShipperRepository shipperRepo;
    private final ShipmentOrderRepository shipmentRepo;
    private final ShipperTransactionRepository transRepo;

    public DashboardResponseDto getDashboard(LocalDate from, LocalDate to) {

        DashboardSummaryDto summary = buildSummary(from, to);

        // Chuyển LocalDate sang LocalDateTime cho chart
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59, 999_999_999);

        List<DashboardChartPointDto> chart = buildChart(fromDateTime, toDateTime);
        List<TopShipperDto> top = buildTopShippers(fromDateTime, toDateTime);

        return new DashboardResponseDto(summary, chart, top);
    }

    private DashboardSummaryDto buildSummary(LocalDate from, LocalDate to) {

        Integer totalShippers = shipperRepo.countActiveShippers();
        Integer totalOrders = shipmentRepo.countByDateRange(from, to);

        BigDecimal codCollected = transRepo.sumAmountByTypeAndDate(ShipperTransactionType.COLLECT_COD, from, to);
        BigDecimal codDeposited = transRepo.sumAmountByTypeAndDate(ShipperTransactionType.DEPOSIT_COD, from, to);
        BigDecimal bonus = transRepo.sumAmountByTypeAndDate(ShipperTransactionType.BONUS, from, to);

        BigDecimal shippingFee = shipmentRepo.sumShippingFee(from, to);

        BigDecimal codRemaining = codCollected.subtract(codDeposited);

        return new DashboardSummaryDto(
                totalShippers,
                totalOrders,
                codCollected,
                codDeposited,
                codRemaining,
                bonus,
                shippingFee
        );
    }
    private List<DashboardChartPointDto> buildChart(LocalDateTime from, LocalDateTime to) {
        return transRepo.getDailyStats(from, to)
                .stream()
                .map(p -> new DashboardChartPointDto(
                        p.getDate().toLocalDate().toString(),   // convert java.sql.Date -> LocalDate
                        p.getCodCollected(),
                        p.getCodDeposited(),
                        p.getCodRemaining()
                ))
                .toList();
    }

    private List<TopShipperDto> buildTopShippers(LocalDateTime from, LocalDateTime to) {
        return transRepo.getTopShippers(from, to)
                .stream()
                .map(p -> new TopShipperDto(
                        p.getFullName(),
                        p.getCodCollected(),
                        p.getCodRemaining()
                ))
                .toList();
    }
}

