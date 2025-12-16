package com.example.smart_mall_spring.Controllers.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipmentReport.ShipmentReportRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentReport.ShipmentReportResponseDto;
import com.example.smart_mall_spring.Services.Logistics.ShipmentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/reports")
@RequiredArgsConstructor
public class ShipmentReportController {

    private final ShipmentReportService shipmentReportService;

    @GetMapping
    public ResponseEntity<List<ShipmentReportResponseDto>> getAllReports() {
        return ResponseEntity.ok(shipmentReportService.getAllReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentReportResponseDto> getReportById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipmentReportService.getReportById(id));
    }
    // Lấy báo cáo theo công ty + khoảng thời gian
    @GetMapping("/company")
    public ResponseEntity<List<ShipmentReportResponseDto>> getReportsByCompany(
            @RequestParam UUID companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(shipmentReportService.getReportsByCompany(companyId, start, end));
    }

    @GetMapping("/range")
    public ResponseEntity<List<ShipmentReportResponseDto>> getReportsBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(shipmentReportService.getReportsBetween(start, end));
    }

    @PostMapping
    public ResponseEntity<ShipmentReportResponseDto> createReport(@RequestBody ShipmentReportRequestDto dto) {
        return ResponseEntity.ok(shipmentReportService.createReport(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShipmentReportResponseDto> updateReport(
            @PathVariable UUID id,
            @RequestBody ShipmentReportRequestDto dto) {
        return ResponseEntity.ok(shipmentReportService.updateReport(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID id) {
        shipmentReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/generate/day")
    public ResponseEntity<ShipmentReportResponseDto> generateSingleDayReport(
            @RequestParam UUID companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(shipmentReportService.generateSingleDayReport(companyId, date));
    }

}