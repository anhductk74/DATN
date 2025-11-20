package com.example.smart_mall_spring.Repositories.Logistics;


import com.example.smart_mall_spring.Entities.Logistics.ShippingCompany;
import com.example.smart_mall_spring.Enum.ShippingCompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShippingCompanyRepository extends JpaRepository<ShippingCompany, UUID> {

    // Tìm theo mã code
    @Query("SELECT sc FROM ShippingCompany sc WHERE sc.code = :code")
    Optional<ShippingCompany> findByCode(@Param("code") String code);

    // Tìm theo tên gần đúng (dùng LIKE)
    @Query("SELECT sc FROM ShippingCompany sc WHERE LOWER(sc.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<ShippingCompany> searchByName(@Param("name") String name);

    // Lọc theo trạng thái (ACTIVE, INACTIVE, SUSPENDED)
    @Query("SELECT sc FROM ShippingCompany sc WHERE sc.status = :status")
    List<ShippingCompany> findByStatus(@Param("status") ShippingCompanyStatus status);

    // Lấy danh sách công ty có email không null
    @Query("SELECT sc FROM ShippingCompany sc WHERE sc.contactEmail IS NOT NULL")
    List<ShippingCompany> findAllWithEmail();

    // Đếm số lượng công ty đang hoạt động
    @Query("SELECT COUNT(sc) FROM ShippingCompany sc WHERE sc.status = 'ACTIVE'")
    long countActiveCompanies();
}