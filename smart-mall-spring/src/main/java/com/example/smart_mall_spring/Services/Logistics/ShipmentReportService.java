package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.ShipmentReport.ShipmentReportRequestDto;
import com.example.smart_mall_spring.Dtos.Logistic.ShipmentReport.ShipmentReportResponseDto;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentOrder;
import com.example.smart_mall_spring.Entities.Logistics.ShipmentReport;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentOrderRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentReportRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShippingCompanyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentReportService {

    private final ShipmentReportRepository shipmentReportRepository;
    private final ShipmentOrderRepository shipmentOrderRepository;
    private final ShippingCompanyRepository companyRepo;

    // Mapper nội bộ
    private ShipmentReportResponseDto toDto(ShipmentReport entity) {
        return ShipmentReportResponseDto.builder()
                .id(entity.getId())
                .reportDate(entity.getReportDate())
                .companyId(entity.getShippingCompany() != null ? entity.getShippingCompany().getId() : null)
                .companyName(entity.getShippingCompany() != null ? entity.getShippingCompany().getName() : null)
                .totalOrders(entity.getTotalOrders())
                .deliveredOrders(entity.getDeliveredOrders())
                .returnedOrders(entity.getReturnedOrders())
                .totalCod(entity.getTotalCod())
                .totalShippingFee(entity.getTotalShippingFee())
                .successRate(entity.getSuccessRate())
                .build();
    }

    private ShipmentReport toEntity(ShipmentReportRequestDto dto) {
        ShipmentReport entity = new ShipmentReport();
        entity.setReportDate(dto.getReportDate());
        entity.setTotalOrders(dto.getTotalOrders());
        entity.setDeliveredOrders(dto.getDeliveredOrders());
        entity.setReturnedOrders(dto.getReturnedOrders());
        entity.setTotalCod(dto.getTotalCod());
        entity.setTotalShippingFee(dto.getTotalShippingFee());
        entity.setSuccessRate(dto.getSuccessRate());

        if (dto.getCompanyId() != null) {
            entity.setShippingCompany(
                    companyRepo.findById(dto.getCompanyId())
                            .orElseThrow(() -> new RuntimeException("Company not found"))
            );
        }
        return entity;
    }

    public List<ShipmentReportResponseDto> getAllReports() {
        return shipmentReportRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    public List<ShipmentReportResponseDto> getReportsByCompany(UUID companyId, LocalDate start, LocalDate end) {
        return shipmentReportRepository.findReportsByCompany(companyId, start, end)
                .stream().map(this::toDto).toList();
    }

    public ShipmentReportResponseDto getReportById(UUID id) {
        return shipmentReportRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Shipment report not found"));
    }

    public List<ShipmentReportResponseDto> getReportsBetween(LocalDate start, LocalDate end) {
        return shipmentReportRepository.findReportsBetweenDates(start, end).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ShipmentReportResponseDto createReport(ShipmentReportRequestDto dto) {
        ShipmentReport entity = toEntity(dto);
        return toDto(shipmentReportRepository.save(entity));
    }

    public ShipmentReportResponseDto updateReport(UUID id, ShipmentReportRequestDto dto) {
        ShipmentReport existing = shipmentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment report not found"));

        existing.setReportDate(dto.getReportDate());
        existing.setTotalOrders(dto.getTotalOrders());
        existing.setDeliveredOrders(dto.getDeliveredOrders());
        existing.setReturnedOrders(dto.getReturnedOrders());
        existing.setTotalCod(dto.getTotalCod());
        existing.setTotalShippingFee(dto.getTotalShippingFee());
        existing.setSuccessRate(dto.getSuccessRate());

        if (dto.getCompanyId() != null) {
            existing.setShippingCompany(
                    companyRepo.findById(dto.getCompanyId())
                            .orElseThrow(() -> new RuntimeException("Company not found"))
            );
        }

        return toDto(shipmentReportRepository.save(existing));
    }


    public void deleteReport(UUID id) {
        shipmentReportRepository.deleteById(id);
    }

    // Generate báo cáo theo 1 ngày cho công ty
    @Transactional
    public ShipmentReportResponseDto generateSingleDayReport(UUID companyId, LocalDate date) {

        List<ShipmentOrder> orders =
                shipmentOrderRepository.findByCompanyAndDate(companyId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());

        int totalOrders = orders.size();
        int deliveredOrders = (int) orders.stream().filter(o -> o.getStatus() == ShipmentStatus.DELIVERED).count();
        int returnedOrders = (int) orders.stream().filter(o -> o.getStatus() == ShipmentStatus.RETURNED).count();
        BigDecimal totalCod = orders.stream().map(ShipmentOrder::getCodAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalShippingFee = orders.stream().map(ShipmentOrder::getShippingFee).reduce(BigDecimal.ZERO, BigDecimal::add);
        double successRate = totalOrders == 0 ? 0 : (double) deliveredOrders / totalOrders;

        ShipmentReport report = shipmentReportRepository
                .findByReportDateAndShippingCompany_Id(date, companyId)
                .orElse(new ShipmentReport());

        report.setReportDate(date);
        report.setShippingCompany(companyRepo.findById(companyId).orElse(null));
        report.setTotalOrders(totalOrders);
        report.setDeliveredOrders(deliveredOrders);
        report.setReturnedOrders(returnedOrders);
        report.setTotalCod(totalCod);
        report.setTotalShippingFee(totalShippingFee);
        report.setSuccessRate(successRate);

        shipmentReportRepository.save(report);
        return toDto(report);
    }

    @Transactional
    public void updateReportByShipment(ShipmentOrder shipmentOrder) {
        UUID companyId = shipmentOrder.getWarehouse().getShippingCompany().getId();
        LocalDate date = shipmentOrder.getCreatedAt().toLocalDate();

        // Lấy tất cả đơn theo công ty + ngày
        List<ShipmentOrder> orders = shipmentOrderRepository.findByCompanyAndDate(
                companyId,
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay()
        );

        int totalOrders = orders.size();
        int deliveredOrders = (int) orders.stream()
                .filter(o -> o.getStatus() == ShipmentStatus.DELIVERED)
                .count();
        int returnedOrders = (int) orders.stream()
                .filter(o -> o.getStatus() == ShipmentStatus.RETURNED)
                .count();

        BigDecimal totalCod = orders.stream()
                .map(ShipmentOrder::getCodAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalShippingFee = orders.stream()
                .map(ShipmentOrder::getShippingFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double successRate = totalOrders == 0 ? 0 : (double) deliveredOrders / totalOrders;

        // Lấy báo cáo theo ngày + công ty
        ShipmentReport report = shipmentReportRepository
                .findByReportDateAndShippingCompany_Id(date, companyId)
                .orElse(new ShipmentReport());

        report.setReportDate(date);
        report.setShippingCompany(shipmentOrder.getWarehouse().getShippingCompany());
        report.setTotalOrders(totalOrders);
        report.setDeliveredOrders(deliveredOrders);
        report.setReturnedOrders(returnedOrders);
        report.setTotalCod(totalCod);
        report.setTotalShippingFee(totalShippingFee);
        report.setSuccessRate(successRate);

        shipmentReportRepository.save(report);
    }

}
