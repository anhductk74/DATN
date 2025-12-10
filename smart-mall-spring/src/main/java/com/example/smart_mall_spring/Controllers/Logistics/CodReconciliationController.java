package com.example.smart_mall_spring.Controllers.Logistics;



import com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation.CodReconciliationRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation.CodReconciliationResponseDto;
import com.example.smart_mall_spring.Dtos.Logistic.CodReconciliation.CodReconciliationUpdateStatusDto;
import com.example.smart_mall_spring.Services.Logistics.CodReconciliationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/logistics/cod-reconciliation")
@RequiredArgsConstructor
public class CodReconciliationController {

    private final CodReconciliationService codService;

    @PostMapping
    public CodReconciliationResponseDto create(
            @RequestBody CodReconciliationRequestDto request,
            @RequestParam UUID companyId  // thêm companyId
    ) {
        return codService.create(request, companyId);
    }

    @GetMapping
    public List<CodReconciliationResponseDto> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return codService.getByDate(date);
    }

    @PutMapping("/{id}/status")
    public CodReconciliationResponseDto updateStatus(
            @PathVariable UUID id,
            @RequestBody CodReconciliationUpdateStatusDto dto) {

        return codService.updateStatus(id, dto);
    }

    @PostMapping("/shipper/{shipperId}")
    public CodReconciliationResponseDto createByShipper(
            @PathVariable UUID shipperId,
            @RequestParam UUID companyId  // thêm companyId
    ) {
        return codService.createByShipper(shipperId, companyId);
    }

    @PutMapping("/{id}/complete")
    public CodReconciliationResponseDto complete(@PathVariable UUID id) {
        return codService.complete(id);
    }
}