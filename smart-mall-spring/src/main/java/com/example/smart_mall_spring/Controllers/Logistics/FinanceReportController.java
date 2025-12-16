package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Services.Logistics.FinanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/finance/report")
@RequiredArgsConstructor
public class FinanceReportController {

    private final FinanceReportService service;

    /**
     * Super Admin - xem toàn hệ thống
     */
    @GetMapping("/global")
    public Object getGlobal(
            @RequestParam @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate date
    ) {
        return service.getGlobalReport(date);
    }

    /**
     * Admin công ty vận chuyển - xem báo cáo của công ty họ
     */
    @GetMapping("/company")
    public Object getCompanyReport(
            @RequestParam @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate date,
            @RequestParam UUID companyId
    ) {
        return service.getReportForCompany(date, companyId);
    }

    /**
     * Shipper - xem báo cáo cá nhân
     */
    @GetMapping("/shipper")
    public Object getShipperReport(
            @RequestParam @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate date,
            @RequestParam UUID shipperId
    ) {
        return service.getReportForShipper(date, shipperId);
    }
}