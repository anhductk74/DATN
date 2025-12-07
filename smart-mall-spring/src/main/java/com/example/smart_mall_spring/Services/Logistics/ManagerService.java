package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Manager.ManagerResponseDto;
import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Logistics.Manager;
import com.example.smart_mall_spring.Entities.Logistics.ShippingCompany;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserProfile;
import com.example.smart_mall_spring.Repositories.Logistics.ManagerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ManagerService {

    private final ManagerRepository managerRepository;

    // Lấy tất cả managers
    public Map<String, Object> getAllManagers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Manager> managerPage = managerRepository.findAll(pageable);

        // Lọc theo search (nếu có)
        List<ManagerResponseDto> filtered = managerPage.getContent().stream()
                .filter(manager -> {
                    if (search == null || search.isEmpty()) {
                        return true;
                    }
                    
                    User user = manager.getUser();
                    UserProfile profile = user != null ? user.getProfile() : null;
                    ShippingCompany company = manager.getShippingCompany();
                    
                    String fullName = profile != null ? profile.getFullName() : "";
                    String phoneNumber = profile != null ? profile.getPhoneNumber() : "";
                    String email = user != null ? user.getUsername() : "";
                    String companyName = company != null ? company.getName() : "";
                    String companyCode = company != null ? company.getCode() : "";
                    
                    return fullName.toLowerCase().contains(search.toLowerCase())
                            || phoneNumber.contains(search)
                            || email.toLowerCase().contains(search.toLowerCase())
                            || companyName.toLowerCase().contains(search.toLowerCase())
                            || (companyCode != null && companyCode.toLowerCase().contains(search.toLowerCase()));
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", filtered);
        response.put("currentPage", page);
        response.put("totalItems", managerPage.getTotalElements());
        response.put("totalPages", managerPage.getTotalPages());
        return response;
    }

    // Lấy manager theo ID
    public ManagerResponseDto getManagerById(UUID id) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy manager với ID: " + id));
        return mapToDto(manager);
    }

    // Lấy manager theo User ID
    public ManagerResponseDto getManagerByUserId(UUID userId) {
        Manager manager = managerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy manager với User ID: " + userId));
        return mapToDto(manager);
    }

    // Xóa manager
    public void deleteManager(UUID id) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy manager với ID: " + id));
        managerRepository.delete(manager);
    }

    // Mapper
    private ManagerResponseDto mapToDto(Manager entity) {
        User user = entity.getUser();
        UserProfile profile = user != null ? user.getProfile() : null;
        ShippingCompany company = entity.getShippingCompany();
        Address companyAddress = company != null ? company.getHeadquartersAddress() : null;

        String companyStreet = companyAddress != null ? companyAddress.getStreet() : null;
        String companyCommune = companyAddress != null ? companyAddress.getCommune() : null;
        String companyDistrict = companyAddress != null ? companyAddress.getDistrict() : null;
        String companyCity = companyAddress != null ? companyAddress.getCity() : null;

        String companyFullAddress = null;
        if (companyAddress != null) {
            companyFullAddress = String.format("%s, %s, %s, %s",
                    companyStreet != null ? companyStreet : "",
                    companyCommune != null ? companyCommune : "",
                    companyDistrict != null ? companyDistrict : "",
                    companyCity != null ? companyCity : "").replaceAll("^, |, $", "");
        }

        return ManagerResponseDto.builder()
                .managerId(entity.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .fullName(profile != null ? profile.getFullName() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .avatar(profile != null ? profile.getAvatar() : null)
                .isActive(user != null ? user.getIsActive() : null)
                .companyId(company != null ? company.getId() : null)
                .companyName(company != null ? company.getName() : null)
                .companyCode(company != null ? company.getCode() : null)
                .companyContactEmail(company != null ? company.getContactEmail() : null)
                .companyContactPhone(company != null ? company.getContactPhone() : null)
                .companyStreet(companyStreet)
                .companyCommune(companyCommune)
                .companyDistrict(companyDistrict)
                .companyCity(companyCity)
                .companyFullAddress(companyFullAddress)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
