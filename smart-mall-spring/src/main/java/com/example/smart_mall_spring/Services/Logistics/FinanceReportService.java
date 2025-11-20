package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Enum.TransactionType;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceReportService {

    private final ShipperTransactionRepository transactionRepo;

    public Map<String, Object> getReportByDate(LocalDate date) {

        BigDecimal collected = transactionRepo.sumAllByTypeAndDate(TransactionType.COLLECT_COD, date);
        BigDecimal deposited = transactionRepo.sumAllByTypeAndDate(TransactionType.DEPOSIT_COD, date);
        BigDecimal bonus = transactionRepo.sumAllByTypeAndDate(TransactionType.BONUS, date);

        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("totalCollected", collected);
        result.put("totalDeposited", deposited);
        result.put("totalBonus", bonus);
        result.put("difference", collected.subtract(deposited));

        return result;
    }
}