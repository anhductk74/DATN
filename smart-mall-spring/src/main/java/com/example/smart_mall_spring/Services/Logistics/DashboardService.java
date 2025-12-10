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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ShipperRepository shipperRepo;
    private final ShipmentOrderRepository shipmentRepo;
    private final ShipperTransactionRepository transRepo;

    public DashboardResponseDto getDashboard(LocalDate from, LocalDate to, UUID companyId) {

        DashboardSummaryDto summary = buildSummary(from, to, companyId);

        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59, 999_999_999);

        List<DashboardChartPointDto> chart = buildChart(fromDateTime, toDateTime, companyId);
        List<TopShipperDto> top = buildTopShippers(fromDateTime, toDateTime, companyId);

        return new DashboardResponseDto(summary, chart, top);
    }

    // ================= SUMMARY =================
    private DashboardSummaryDto buildSummary(LocalDate from, LocalDate to, UUID companyId) {

        LocalDateTime startDateTime = from.atStartOfDay();
        LocalDateTime endDateTime = to.atTime(23, 59, 59, 999_999_999);

        Integer totalShippers = shipperRepo.countActiveShippersByCompany(companyId);

        // Đếm tổng đơn hàng theo LocalDateTime
        Integer totalOrders = shipmentRepo.countByDateRangeAndCompany(
                startDateTime, endDateTime, companyId
        );

        // Tổng phí ship cũng theo LocalDateTime
        BigDecimal shippingFee = shipmentRepo.sumShippingFeeByCompany(
                startDateTime, endDateTime, companyId
        );

        // Repo này dùng LocalDateTime → phải truyền đúng chuẩn
        BigDecimal codCollected = transRepo.sumAmountByTypeAndDate(
                ShipperTransactionType.COLLECT_COD, startDateTime, endDateTime, companyId
        );
        BigDecimal codDeposited = transRepo.sumAmountByTypeAndDate(
                ShipperTransactionType.DEPOSIT_COD, startDateTime, endDateTime, companyId
        );
        BigDecimal bonus = transRepo.sumAmountByTypeAndDate(
                ShipperTransactionType.BONUS, startDateTime, endDateTime, companyId
        );

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



    // ================= CHART =================
    private List<DashboardChartPointDto> buildChart(LocalDateTime from, LocalDateTime to, UUID companyId) {
        return transRepo.getDailyStatsByCompany(from, to, companyId)
                .stream()
                .map(p -> new DashboardChartPointDto(
                        p.getDate().toString(),  // p.getDate() đã là String vì query trả đúng DTO
                        p.getCodCollected(),
                        p.getCodDeposited(),
                        p.getBalance()
                ))
                .toList();
    }

    // ================= TOP SHIPPERS =================
    private List<TopShipperDto> buildTopShippers(LocalDateTime from, LocalDateTime to, UUID companyId) {
        return transRepo.getTopShippers(from, to, companyId)
                .stream()
                .map(p -> new TopShipperDto(
                        p.getFullName(),
                        p.getCodCollected(),
                        p.getCodRemaining()
                ))
                .toList();
    }
}

