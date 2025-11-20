package com.example.smart_mall_spring.Controllers.Logistics;


import com.example.smart_mall_spring.Dtos.Logistic.ShipperBalanceHistory.ShipperBalanceHistoryRequestDto;
import com.example.smart_mall_spring.Services.Logistics.CodReconciliationService;
import com.example.smart_mall_spring.Services.Logistics.ShipperBalanceHistoryService;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logistics/daily-job")
@RequiredArgsConstructor
public class DailyJobController {

    private final CodReconciliationService codService;
    private final ShipperBalanceHistoryService balanceService;
    private final ShipperRepository shipperRepo;

    /**
     * Gọi API này để chạy toàn bộ job cho tất cả Shipper
     */
    @PostMapping("/run")
    public String runDailyJob() {

        var shippers = shipperRepo.findAll();

        if (shippers.isEmpty()) {
            return "Không có shipper nào trong hệ thống.";
        }

        // Tạo COD Reconciliation cho từng shipper
        shippers.forEach(shipper -> codService.createByShipper(shipper.getId()));

        // Tạo Balance History cho từng shipper
        shippers.forEach(shipper -> {
            var req = new ShipperBalanceHistoryRequestDto();
            req.setShipperId(shipper.getId());
            balanceService.createDailyHistory(req);
        });

        return "Đã tạo COD reconciliation & balance history cho tất cả shipper.";
    }
}