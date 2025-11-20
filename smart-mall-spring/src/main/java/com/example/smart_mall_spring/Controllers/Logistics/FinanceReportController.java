package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Services.Logistics.FinanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/logistics/finance/report")
@RequiredArgsConstructor
public class FinanceReportController {

    private final FinanceReportService service;

    @GetMapping("/date")
    public Object byDate(@RequestParam @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate date) {
        return service.getReportByDate(date);
    }
}