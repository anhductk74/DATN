package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Enum.ShipperTransactionType;
import com.example.smart_mall_spring.Exception.EntityNotFoundException;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceReportService {

    private final ShipperTransactionRepository transactionRepo;
    private final ShipperRepository shipperRepo;

    //  Super Admin: Toàn bộ hệ thống
    public Map<String, Object> getGlobalReport(LocalDate date) {
        // Lấy tổng theo tất cả các công ty
        BigDecimal collected = transactionRepo.sumAllByTypeAndDate(ShipperTransactionType.COLLECT_COD, date, null);
        BigDecimal deposited = transactionRepo.sumAllByTypeAndDate(ShipperTransactionType.DEPOSIT_COD, date, null);
        BigDecimal bonus = transactionRepo.sumAllByTypeAndDate(ShipperTransactionType.BONUS, date, null);

        return buildReportResult(date, collected, deposited, bonus);
    }

    //  Admin công ty: theo công ty
    public Map<String, Object> getReportForCompany(LocalDate date, UUID companyId) {
        BigDecimal collected = transactionRepo.sumByTypeAndCompanyAndDate(ShipperTransactionType.COLLECT_COD, companyId, date);
        BigDecimal deposited = transactionRepo.sumByTypeAndCompanyAndDate(ShipperTransactionType.DEPOSIT_COD, companyId, date);
        BigDecimal bonus = transactionRepo.sumByTypeAndCompanyAndDate(ShipperTransactionType.BONUS, companyId, date);

        return buildReportResult(date, collected, deposited, bonus);
    }

    //  Shipper: theo cá nhân shipper
    public Map<String, Object> getReportForShipper(LocalDate date, UUID shipperId) {
        // Lấy shipper và companyId
        Shipper shipper = shipperRepo.findById(shipperId)
                .orElseThrow(() -> new EntityNotFoundException("Shipper không tồn tại: " + shipperId));

        UUID companyId = shipper.getShippingCompany() != null ? shipper.getShippingCompany().getId() : null;
        if (companyId == null) {
            throw new EntityNotFoundException("Shipper chưa gán công ty: " + shipperId);
        }

        BigDecimal collected = transactionRepo.sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.COLLECT_COD, date, companyId);
        BigDecimal deposited = transactionRepo.sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.DEPOSIT_COD, date, companyId);
        BigDecimal bonus = transactionRepo.sumByTypeAndShipperAndDate(shipperId, ShipperTransactionType.BONUS, date, companyId);

        return buildReportResult(date, collected, deposited, bonus);
    }


    // Helper build response
    private Map<String, Object> buildReportResult(LocalDate date, BigDecimal collected, BigDecimal deposited, BigDecimal bonus) {
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("totalCollected", collected);
        result.put("totalDeposited", deposited);
        result.put("totalBonus", bonus);
        result.put("difference", collected.subtract(deposited));
        return result;
    }
}