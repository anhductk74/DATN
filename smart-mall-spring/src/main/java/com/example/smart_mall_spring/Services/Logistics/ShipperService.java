package com.example.smart_mall_spring.Services.Logistics;

import com.example.smart_mall_spring.Dtos.Logistic.Shipper.*;
import com.example.smart_mall_spring.Entities.Address;
import com.example.smart_mall_spring.Entities.Logistics.Manager;
import com.example.smart_mall_spring.Entities.Logistics.Shipper;
import com.example.smart_mall_spring.Entities.Logistics.ShippingCompany;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserAddress;
import com.example.smart_mall_spring.Entities.Users.UserProfile;
import com.example.smart_mall_spring.Entities.Users.Role;
import com.example.smart_mall_spring.Enum.AddressType;
import com.example.smart_mall_spring.Enum.Gender;
import com.example.smart_mall_spring.Enum.ShipmentStatus;
import com.example.smart_mall_spring.Enum.ShipperStatus;
import com.example.smart_mall_spring.Enum.Status;
import com.example.smart_mall_spring.Repositories.Logistics.ShipmentOrderRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ManagerRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShipperRepository;
import com.example.smart_mall_spring.Repositories.Logistics.ShippingCompanyRepository;
import com.example.smart_mall_spring.Repositories.RoleRepository;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Services.CloudinaryService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ShipperService {

    private final ShipperRepository shipperRepository;
    private final ShippingCompanyRepository shippingCompanyRepository;
    private final ManagerRepository managerRepository;
    private final ShipmentOrderRepository shipmentOrderRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final EntityManager entityManager;

    // ============================
    //      SHIPPER STATISTICS
    // ============================
    public ShipperStatisticsResponse getShipperStatistics() {
        long total = shipperRepository.countAllShippers();

        long active = shipperRepository.countByStatus(ShipperStatus.ACTIVE);
        long busy = shipperRepository.countByStatus(ShipperStatus.BUSY);
        long inactive = shipperRepository.countByStatus(ShipperStatus.INACTIVE);
        long onLeave = shipperRepository.countByStatus(ShipperStatus.ON_LEAVE);
        long suspended = shipperRepository.countByStatus(ShipperStatus.SUSPENDED);

        return ShipperStatisticsResponse.builder()
                .total(total)
                .active(active)
                .busy(busy)
                .inactive(inactive)
                .onLeave(onLeave)
                .suspended(suspended)
                .build();
    }

    // ===================================
    //      SHIPPER DELIVERY STATISTICS
    // ===================================
    public ShipperDeliveryStatisticsResponse getShipperDeliveryStatistics(UUID shipperId) {

        long totalDeliveries = shipmentOrderRepository.countByShipperId(shipperId);

        long successfulDeliveries =
                shipmentOrderRepository.countByShipperIdAndStatus(shipperId, ShipmentStatus.DELIVERED);

        long failedDeliveries =
                shipmentOrderRepository.countByShipperIdAndStatus(shipperId, ShipmentStatus.CANCELLED);


        double successRate = totalDeliveries == 0
                ? 0
                : (double) successfulDeliveries / totalDeliveries * 100;

        return ShipperDeliveryStatisticsResponse.builder()
                .totalDeliveries(totalDeliveries)
                .successfulDeliveries(successfulDeliveries)
                .failedDeliveries(failedDeliveries)
                .successRate(successRate)
                .build();
    }

    // ============================
    //   REGISTER SHIPPER BY MANAGER
    // ============================
    @Transactional
    public ShipperResponseDto registerShipper(
            ShipperInfoDto dataInfo,
            MultipartFile idCardFrontImage,
            MultipartFile idCardBackImage,
            MultipartFile driverLicenseImage,
            User currentUser) {
        
        // 1. Validate email
        if (userRepository.existsByUsername(dataInfo.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng: " + dataInfo.getEmail());
        }
        
        // 2. Validate shipping company
        ShippingCompany shippingCompany = shippingCompanyRepository.findById(dataInfo.getShippingCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển"));
        
        // 3. Validate manager can only create shipper for their company
        UUID managerCompanyId = getManagerCompanyId(currentUser);
        if (managerCompanyId != null && !managerCompanyId.equals(dataInfo.getShippingCompanyId())) {
            throw new IllegalArgumentException("Manager chỉ có thể tạo shipper cho công ty của mình");
        }
        
        // 4. Validate operational region matches company district
        if (shippingCompany.getHeadquartersAddress() != null) {
            String companyDistrict = shippingCompany.getHeadquartersAddress().getDistrict();
            if (companyDistrict != null && !companyDistrict.equalsIgnoreCase(dataInfo.getOperationalDistrict())) {
                throw new IllegalArgumentException(
                    String.format("Khu vực hoạt động của shipper phải thuộc %s (cùng quận/huyện với công ty)", companyDistrict)
                );
            }
        }

        // 5. Create User
        User user = new User();
        user.setUsername(dataInfo.getEmail());
        user.setPassword(passwordEncoder.encode(dataInfo.getPassword()));
        user.setIsActive(1);

        // 6. Assign SHIPPER role
        Role shipperRole = roleRepository.findByName("SHIPPER")
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy role SHIPPER"));
        user.setRoles(List.of(shipperRole));

        // 7. Create UserProfile
        UserProfile profile = new UserProfile();
        profile.setFullName(dataInfo.getFullName());
        profile.setPhoneNumber(dataInfo.getPhoneNumber());
        
        if (dataInfo.getGender() != null && !dataInfo.getGender().isEmpty()) {
            try {
                profile.setGender(Gender.valueOf(dataInfo.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                profile.setGender(null);
            }
        }
        
        profile.setDateOfBirth(dataInfo.getDateOfBirth());
        profile.setUser(user);
        user.setProfile(profile);

        // 8. Create Address and UserAddress
        Address address = new Address();
        address.setStreet(dataInfo.getStreet());
        address.setCommune(dataInfo.getCommune());
        address.setDistrict(dataInfo.getDistrict());
        address.setCity(dataInfo.getCity());

        UserAddress userAddress = new UserAddress();
        userAddress.setUser(user);
        userAddress.setRecipient(dataInfo.getFullName());
        userAddress.setPhoneNumber(dataInfo.getPhoneNumber());
        userAddress.setAddress(address);
        userAddress.setAddressType(AddressType.HOME);
        userAddress.setDefault(true);
        userAddress.setStatus(Status.ACTIVE);

        user.setAddresses(List.of(userAddress));

        // 9. Save User (cascade will save profile and addresses)
        User savedUser = userRepository.save(user);
        userRepository.flush();
        
        // Extract User ID before any operations
        UUID savedUserId = savedUser.getId();
        String savedUsername = savedUser.getUsername();
        String savedFullName = profile.getFullName();
        String savedPhoneNumber = profile.getPhoneNumber();
        Gender savedGender = profile.getGender();
        String savedDateOfBirth = profile.getDateOfBirth();
        String savedAddress = String.format("%s, %s, %s, %s",
            address.getStreet() != null ? address.getStreet() : "",
            address.getCommune() != null ? address.getCommune() : "",
            address.getDistrict() != null ? address.getDistrict() : "",
            address.getCity() != null ? address.getCity() : "");

        // 10. Upload images to Cloudinary
        String idCardFrontUrl = null;
        String idCardBackUrl = null;
        String driverLicenseUrl = null;
        
        if (idCardFrontImage != null && !idCardFrontImage.isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(
                idCardFrontImage, "shippers/id_cards");
            idCardFrontUrl = uploadResult.get("url");
        }
        
        if (idCardBackImage != null && !idCardBackImage.isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(
                idCardBackImage, "shippers/id_cards");
            idCardBackUrl = uploadResult.get("url");
        }
        
        if (driverLicenseImage != null && !driverLicenseImage.isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(
                driverLicenseImage, "shippers/driver_licenses");
            driverLicenseUrl = uploadResult.get("url");
        }

        // 11. Create Shipper
        Shipper shipper = new Shipper();
        shipper.setUser(savedUser);
        shipper.setShippingCompany(shippingCompany);
        shipper.setStatus(ShipperStatus.ACTIVE);
        shipper.setIdCardNumber(dataInfo.getIdCardNumber());
        shipper.setIdCardFrontImage(idCardFrontUrl);
        shipper.setIdCardBackImage(idCardBackUrl);
        shipper.setDriverLicenseNumber(dataInfo.getDriverLicenseNumber());
        shipper.setDriverLicenseImage(driverLicenseUrl);
        shipper.setVehicleType(dataInfo.getVehicleType());
        shipper.setLicensePlate(dataInfo.getLicensePlate());
        shipper.setVehicleBrand(dataInfo.getVehicleBrand());
        shipper.setVehicleColor(dataInfo.getVehicleColor());
        
        // Create operational region
        Address operationalRegion = new Address();
        operationalRegion.setStreet("");
        operationalRegion.setCommune(dataInfo.getOperationalCommune());
        operationalRegion.setDistrict(dataInfo.getOperationalDistrict());
        operationalRegion.setCity(dataInfo.getOperationalCity());
        shipper.setOperationalRegion(operationalRegion);
        
        shipper.setMaxDeliveryRadius(dataInfo.getMaxDeliveryRadius());

        Shipper savedShipper = shipperRepository.save(shipper);
        shipperRepository.flush();
        
        // Extract Shipper data before detaching
        UUID shipperId = savedShipper.getId();
        ShipperStatus shipperStatus = savedShipper.getStatus();
        String opCommune = operationalRegion.getCommune();
        String opDistrict = operationalRegion.getDistrict();
        String opCity = operationalRegion.getCity();
        UUID companyId = shippingCompany.getId();
        String companyName = shippingCompany.getName();

        // 12. Clear persistence context to detach all entities
        entityManager.clear();
        
        // 13. Build DTO using extracted primitive values (no entity access)
        return ShipperResponseDto.builder()
            .id(shipperId)
            .userId(savedUserId)
            .username(savedUsername)
            .fullName(savedFullName)
            .phoneNumber(savedPhoneNumber)
            .gender(savedGender)
            .dateOfBirth(savedDateOfBirth)
            .address(savedAddress)
            .status(shipperStatus)
            .idCardNumber(dataInfo.getIdCardNumber())
            .idCardFrontImage(idCardFrontUrl)
            .idCardBackImage(idCardBackUrl)
            .driverLicenseNumber(dataInfo.getDriverLicenseNumber())
            .driverLicenseImage(driverLicenseUrl)
            .vehicleType(dataInfo.getVehicleType())
            .licensePlate(dataInfo.getLicensePlate())
            .vehicleBrand(dataInfo.getVehicleBrand())
            .vehicleColor(dataInfo.getVehicleColor())
            .operationalCommune(opCommune)
            .operationalDistrict(opDistrict)
            .operationalCity(opCity)
            .maxDeliveryRadius(dataInfo.getMaxDeliveryRadius())
            .shippingCompanyId(companyId)
            .shippingCompanyName(companyName)
            .build();
    }
    
    // OLD METHOD - Keep for backward compatibility
    @Deprecated
    public ShipperResponseDto registerShipper(ShipperRegisterDto dto, User currentUser) {
        // 1. Kiểm tra email đã tồn tại
        if (userRepository.existsByUsername(dto.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng: " + dto.getEmail());
        }
        
        // 1.1 Validate required fields từ FormData
        if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (dto.getPhoneNumber() == null || dto.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        // 2. Kiểm tra shipping company
        UUID companyId = UUID.fromString(dto.getShippingCompanyId());
        ShippingCompany shippingCompany = shippingCompanyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển"));
        
        // 3. Kiểm tra manager chỉ được tạo shipper cho công ty của mình
        UUID managerCompanyId = getManagerCompanyId(currentUser);
        if (managerCompanyId != null && !managerCompanyId.equals(companyId)) {
            throw new IllegalArgumentException("Manager chỉ có thể tạo shipper cho công ty của mình");
        }
        
        // 3.1. Kiểm tra khu vực hoạt động phải thuộc cùng quận/huyện với công ty
        if (shippingCompany.getHeadquartersAddress() != null) {
            String companyDistrict = shippingCompany.getHeadquartersAddress().getDistrict();
            if (companyDistrict != null && !companyDistrict.equalsIgnoreCase(dto.getOperationalDistrict())) {
                throw new IllegalArgumentException(
                    String.format("Khu vực hoạt động của shipper phải thuộc %s (cùng quận/huyện với công ty)", companyDistrict)
                );
            }
        }

        // 4. Tạo User
        User user = new User();
        user.setUsername(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setIsActive(1); // Active ngay

        // 5. Gán role SHIPPER
        Role shipperRole = roleRepository.findByName("SHIPPER")
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy role SHIPPER"));
        user.setRoles(List.of(shipperRole));

        // 6. Tạo UserProfile
        UserProfile profile = new UserProfile();
        profile.setFullName(dto.getFullName());
        profile.setPhoneNumber(dto.getPhoneNumber());
        
        // Parse Gender từ String
        if (dto.getGender() != null && !dto.getGender().isEmpty()) {
            try {
                profile.setGender(Gender.valueOf(dto.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid gender, set to null
                profile.setGender(null);
            }
        }
        
        profile.setDateOfBirth(dto.getDateOfBirth());
        profile.setUser(user);
        user.setProfile(profile);

        // 7. Tạo Address và UserAddress
        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setCommune(dto.getCommune());
        address.setDistrict(dto.getDistrict());
        address.setCity(dto.getCity());

        UserAddress userAddress = new UserAddress();
        userAddress.setUser(user);
        userAddress.setRecipient(dto.getFullName());
        userAddress.setPhoneNumber(dto.getPhoneNumber());
        userAddress.setAddress(address);
        userAddress.setAddressType(AddressType.HOME);
        userAddress.setDefault(true);
        userAddress.setStatus(Status.ACTIVE);

        user.setAddresses(List.of(userAddress));

        // 8. Lưu User (cascade sẽ lưu profile và addresses)
        User savedUser = userRepository.save(user);
        userRepository.flush(); // Đảm bảo profile đã được insert vào database

        // 9. Upload ảnh lên Cloudinary
        String idCardFrontUrl = null;
        String idCardBackUrl = null;
        String driverLicenseUrl = null;
        
        if (dto.getIdCardFrontImage() != null && !dto.getIdCardFrontImage().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(
                dto.getIdCardFrontImage(), "shippers/id_cards");
            idCardFrontUrl = uploadResult.get("url");
        }
        
        if (dto.getIdCardBackImage() != null && !dto.getIdCardBackImage().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(
                dto.getIdCardBackImage(), "shippers/id_cards");
            idCardBackUrl = uploadResult.get("url");
        }
        
        if (dto.getDriverLicenseImage() != null && !dto.getDriverLicenseImage().isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFileToFolder(
                dto.getDriverLicenseImage(), "shippers/driver_licenses");
            driverLicenseUrl = uploadResult.get("url");
        }

        // 10. Tạo Shipper
        Shipper shipper = new Shipper();
        shipper.setUser(savedUser);
        shipper.setShippingCompany(shippingCompany);
        shipper.setStatus(ShipperStatus.ACTIVE);
        shipper.setIdCardNumber(dto.getIdCardNumber());
        shipper.setIdCardFrontImage(idCardFrontUrl);
        shipper.setIdCardBackImage(idCardBackUrl);
        shipper.setDriverLicenseNumber(dto.getDriverLicenseNumber());
        shipper.setDriverLicenseImage(driverLicenseUrl);
        shipper.setVehicleType(dto.getVehicleType());
        shipper.setLicensePlate(dto.getLicensePlate());
        shipper.setVehicleBrand(dto.getVehicleBrand());
        shipper.setVehicleColor(dto.getVehicleColor());
        
        // Tạo khu vực hoạt động (không cần street)
        Address operationalRegion = new Address();
        operationalRegion.setStreet(""); // Empty string thay vì null (database không cho phép null)
        operationalRegion.setCommune(dto.getOperationalCommune());
        operationalRegion.setDistrict(dto.getOperationalDistrict());
        operationalRegion.setCity(dto.getOperationalCity());
        shipper.setOperationalRegion(operationalRegion);
        
        // Parse maxDeliveryRadius từ String
        if (dto.getMaxDeliveryRadius() != null && !dto.getMaxDeliveryRadius().isEmpty()) {
            try {
                shipper.setMaxDeliveryRadius(Double.parseDouble(dto.getMaxDeliveryRadius()));
            } catch (NumberFormatException e) {
                shipper.setMaxDeliveryRadius(null);
            }
        }

        Shipper savedShipper = shipperRepository.save(shipper);
        shipperRepository.flush();
        
        UUID shipperId = savedShipper.getId();
        UUID userId = savedShipper.getUser().getId();
        
        // Clear persistence context to avoid lazy loading issues
        entityManager.clear();
        
        // Re-fetch if needed
        Shipper refreshedShipper = shipperRepository.findById(shipperId)
            .orElseThrow(() -> new EntityNotFoundException("Shipper not found"));

        return buildShipperResponseDto(refreshedShipper, userId);
    }

    // Lấy tất cả shipper (lọc theo company nếu là manager)
    public Map<String, Object> getAllShippers(String search, String status, String region, User currentUser, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Lấy company ID của manager (nếu là manager)
        UUID managerCompanyId = getManagerCompanyId(currentUser);
        
        Page<Shipper> shipperPage;
        if (managerCompanyId != null) {
            // Manager chỉ xem shipper của công ty mình
            shipperPage = shipperRepository.findByShippingCompanyId(managerCompanyId, pageable);
        } else {
            // Admin xem tất cả
            shipperPage = shipperRepository.findAll(pageable);
        }

        // Lọc thủ công trong Java
        List<ShipperResponseDto> filtered = shipperPage.getContent().stream()
                .filter(shipper -> {
                    boolean matches = true;
                    if (search != null && !search.isEmpty()) {
                        String fullName = shipper.getUser() != null && shipper.getUser().getProfile() != null 
                            ? shipper.getUser().getProfile().getFullName() : "";
                        String phoneNumber = shipper.getUser() != null && shipper.getUser().getProfile() != null 
                            ? shipper.getUser().getProfile().getPhoneNumber() : "";
                        String email = shipper.getUser() != null ? shipper.getUser().getUsername() : "";
                        matches &= fullName.toLowerCase().contains(search.toLowerCase())
                                || phoneNumber.contains(search)
                                || email.toLowerCase().contains(search.toLowerCase());
                    }
                    if (status != null && !status.isEmpty()) {
                        matches &= shipper.getStatus().name().equalsIgnoreCase(status);
                    }
                    if (region != null && !region.isEmpty()) {
                        // Lọc theo commune hoặc district
                        Address opRegion = shipper.getOperationalRegion();
                        if (opRegion != null) {
                            String commune = opRegion.getCommune() != null ? opRegion.getCommune() : "";
                            String district = opRegion.getDistrict() != null ? opRegion.getDistrict() : "";
                            matches &= commune.toLowerCase().contains(region.toLowerCase()) 
                                    || district.toLowerCase().contains(region.toLowerCase());
                        } else {
                            matches = false;
                        }
                    }
                    return matches;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", filtered);
        response.put("currentPage", page);
        response.put("totalItems", shipperPage.getTotalElements());
        response.put("totalPages", shipperPage.getTotalPages());
        return response;
    }

    // Lấy shipper theo ID
    public ShipperResponseDto getShipperById(UUID id, User currentUser) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shipper với ID: " + id));
        
        // Kiểm tra quyền truy cập của manager
        validateManagerAccess(currentUser, shipper);
        
        return mapToDto(shipper);
    }

    // Tạo mới shipper (dùng cho trường hợp user đã tồn tại)
    public ShipperResponseDto createShipper(ShipperRequestDto dto) {
        ShippingCompany company = shippingCompanyRepository.findById(dto.getShippingCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển với ID: " + dto.getShippingCompanyId()));

        // Kiểm tra user tồn tại
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + dto.getUserId()));

        // Kiểm tra user có role phù hợp không
        boolean hasShipperRole = user.getRoles()
                .stream()
                .anyMatch(role -> "SHIPPER".equalsIgnoreCase(role.getName()));

        if (!hasShipperRole) {
            throw new IllegalArgumentException("User không có quyền SHIPPER");
        }

        Shipper shipper = new Shipper();
        shipper.setShippingCompany(company);
        shipper.setUser(user);
        shipper.setStatus(dto.getStatus() != null ? dto.getStatus() : ShipperStatus.ACTIVE);
        shipper.setCurrentLatitude(dto.getLatitude());
        shipper.setCurrentLongitude(dto.getLongitude());
        shipper.setVehicleType(dto.getVehicleType());
        shipper.setLicensePlate(dto.getLicensePlate());
        
        // Tạo khu vực hoạt động nếu có
        if (dto.getOperationalCommune() != null || dto.getOperationalDistrict() != null || dto.getOperationalCity() != null) {
            Address operationalRegion = new Address();
            operationalRegion.setStreet(null);
            operationalRegion.setCommune(dto.getOperationalCommune());
            operationalRegion.setDistrict(dto.getOperationalDistrict());
            operationalRegion.setCity(dto.getOperationalCity());
            shipper.setOperationalRegion(operationalRegion);
        }

        Shipper saved = shipperRepository.save(shipper);
        return mapToDto(saved);
    }

    // Cập nhật shipper
    public ShipperResponseDto updateShipper(UUID id, ShipperRequestDto dto, User currentUser) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shipper với ID: " + id));
        
        // Kiểm tra quyền truy cập của manager
        validateManagerAccess(currentUser, shipper);

        if (dto.getShippingCompanyId() != null) {
            ShippingCompany company = shippingCompanyRepository.findById(dto.getShippingCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy công ty vận chuyển với ID: " + dto.getShippingCompanyId()));
            
            // Kiểm tra manager không thể chuyển shipper sang công ty khác
            UUID managerCompanyId = getManagerCompanyId(currentUser);
            if (managerCompanyId != null && !managerCompanyId.equals(dto.getShippingCompanyId())) {
                throw new IllegalArgumentException("Manager không thể chuyển shipper sang công ty khác");
            }
            
            shipper.setShippingCompany(company);
        }

        if (dto.getStatus() != null) shipper.setStatus(dto.getStatus());
        if (dto.getLatitude() != null) shipper.setCurrentLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) shipper.setCurrentLongitude(dto.getLongitude());
        if (dto.getVehicleType() != null) shipper.setVehicleType(dto.getVehicleType());
        if (dto.getLicensePlate() != null) shipper.setLicensePlate(dto.getLicensePlate());
        if (dto.getVehicleBrand() != null) shipper.setVehicleBrand(dto.getVehicleBrand());
        if (dto.getVehicleColor() != null) shipper.setVehicleColor(dto.getVehicleColor());
        if (dto.getMaxDeliveryRadius() != null) shipper.setMaxDeliveryRadius(dto.getMaxDeliveryRadius());
        
        // Cập nhật khu vực hoạt động
        if (dto.getOperationalCommune() != null || dto.getOperationalDistrict() != null || dto.getOperationalCity() != null) {
            Address operationalRegion = shipper.getOperationalRegion();
            if (operationalRegion == null) {
                operationalRegion = new Address();
            }
            if (dto.getOperationalCommune() != null) operationalRegion.setCommune(dto.getOperationalCommune());
            if (dto.getOperationalDistrict() != null) operationalRegion.setDistrict(dto.getOperationalDistrict());
            if (dto.getOperationalCity() != null) operationalRegion.setCity(dto.getOperationalCity());
            shipper.setOperationalRegion(operationalRegion);
        }

        Shipper updated = shipperRepository.save(shipper);
        return mapToDto(updated);
    }

    // Xóa shipper
    public void deleteShipper(UUID id, User currentUser) {
        Shipper shipper = shipperRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy shipper với ID: " + id));
        
        // Kiểm tra quyền truy cập của manager
        validateManagerAccess(currentUser, shipper);
        
        shipperRepository.deleteById(id);
    }

    // Mapper chuyển đổi entity -> DTO
    private ShipperResponseDto mapToDto(Shipper entity) {
        ShipperResponseDto.ShipperResponseDtoBuilder builder = ShipperResponseDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .currentLatitude(entity.getCurrentLatitude())
                .currentLongitude(entity.getCurrentLongitude())
                .vehicleType(entity.getVehicleType())
                .licensePlate(entity.getLicensePlate())
                .vehicleBrand(entity.getVehicleBrand())
                .vehicleColor(entity.getVehicleColor())
                .maxDeliveryRadius(entity.getMaxDeliveryRadius())
                .idCardNumber(entity.getIdCardNumber())
                .idCardFrontImage(entity.getIdCardFrontImage())
                .idCardBackImage(entity.getIdCardBackImage())
                .driverLicenseNumber(entity.getDriverLicenseNumber())
                .driverLicenseImage(entity.getDriverLicenseImage());
        
        // Operational region (eager loaded)
        Address opRegion = entity.getOperationalRegion();
        if (opRegion != null) {
            builder.operationalCommune(opRegion.getCommune())
                   .operationalDistrict(opRegion.getDistrict())
                   .operationalCity(opRegion.getCity());
            
            String operationalRegionFull = String.format("%s, %s, %s", 
                opRegion.getCommune() != null ? opRegion.getCommune() : "",
                opRegion.getDistrict() != null ? opRegion.getDistrict() : "",
                opRegion.getCity() != null ? opRegion.getCity() : "").replaceAll("^, |, $", "");
            builder.operationalRegionFull(operationalRegionFull);
        }
        
        // Load User and Profile data using JPQL to avoid lazy loading issues
        if (entity.getUser() != null) {
            UUID userId = entity.getUser().getId();
            try {
                Object[] userBasicData = (Object[]) entityManager.createQuery(
                    "SELECT u.id, u.username, p.fullName, p.phoneNumber, p.avatar, p.gender, p.dateOfBirth " +
                    "FROM User u LEFT JOIN u.profile p WHERE u.id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
                
                if (userBasicData != null) {
                    builder.userId((UUID) userBasicData[0])
                           .username((String) userBasicData[1])
                           .fullName((String) userBasicData[2])
                           .phoneNumber((String) userBasicData[3])
                           .avatar((String) userBasicData[4])
                           .gender((Gender) userBasicData[5]);
                    
                    if (userBasicData[6] != null) {
                        builder.dateOfBirth(userBasicData[6].toString());
                    }
                }
                
                // Fetch default address
                List<?> addressDataList = entityManager.createQuery(
                    "SELECT a.street, a.commune, a.district, a.city " +
                    "FROM UserAddress ua JOIN ua.address a WHERE ua.user.id = :userId AND ua.isDefault = true")
                    .setParameter("userId", userId)
                    .setMaxResults(1)
                    .getResultList();
                
                if (!addressDataList.isEmpty()) {
                    Object[] addr = (Object[]) addressDataList.get(0);
                    String address = String.format("%s, %s, %s, %s", 
                        addr[0] != null ? addr[0] : "",
                        addr[1] != null ? addr[1] : "",
                        addr[2] != null ? addr[2] : "",
                        addr[3] != null ? addr[3] : "");
                    builder.address(address);
                }
            } catch (Exception e) {
                // Log error but continue
                System.err.println("Error loading user data for shipper: " + e.getMessage());
            }
        }
        
        // Load Shipping Company info
        if (entity.getShippingCompany() != null) {
            builder.shippingCompanyId(entity.getShippingCompany().getId())
                   .shippingCompanyName(entity.getShippingCompany().getName());
        }
        
        return builder.build();
    }
    
    // NEW: Method to map with full details (use only when needed)
    private ShipperResponseDto mapToDtoWithDetails(Shipper entity) {
        return buildShipperResponseDto(entity, entity.getUser() != null ? entity.getUser().getId() : null);
    }
    
    // Helper method to safely build ShipperResponseDto
    private ShipperResponseDto buildShipperResponseDto(Shipper shipper, UUID userId) {
        ShipperResponseDto.ShipperResponseDtoBuilder builder = ShipperResponseDto.builder();
        
        // Map basic shipper fields
        builder.id(shipper.getId())
               .status(shipper.getStatus())
               .idCardNumber(shipper.getIdCardNumber())
               .idCardFrontImage(shipper.getIdCardFrontImage())
               .idCardBackImage(shipper.getIdCardBackImage())
               .driverLicenseNumber(shipper.getDriverLicenseNumber())
               .driverLicenseImage(shipper.getDriverLicenseImage())
               .vehicleType(shipper.getVehicleType())
               .licensePlate(shipper.getLicensePlate())
               .vehicleBrand(shipper.getVehicleBrand())
               .vehicleColor(shipper.getVehicleColor())
               .maxDeliveryRadius(shipper.getMaxDeliveryRadius())
               .currentLatitude(shipper.getCurrentLatitude())
               .currentLongitude(shipper.getCurrentLongitude());
        
        // Map operational region
        if (shipper.getOperationalRegion() != null) {
            Address opRegion = shipper.getOperationalRegion();
            builder.operationalCommune(opRegion.getCommune())
                   .operationalDistrict(opRegion.getDistrict())
                   .operationalCity(opRegion.getCity());
        }
        
        // Fetch user data with explicit query to avoid lazy loading
        if (userId != null) {
            try {
                // Use JPQL query to fetch only needed fields
                Object[] userBasicData = (Object[]) entityManager.createQuery(
                    "SELECT u.id, u.username, p.fullName, p.phoneNumber, p.avatar, p.gender, p.dateOfBirth " +
                    "FROM User u LEFT JOIN u.profile p WHERE u.id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
                
                if (userBasicData != null) {
                    builder.userId((UUID) userBasicData[0])
                           .username((String) userBasicData[1])
                           .fullName((String) userBasicData[2])
                           .phoneNumber((String) userBasicData[3])
                           .avatar((String) userBasicData[4])
                           .gender((Gender) userBasicData[5]);
                    
                    // Handle dateOfBirth conversion
                    if (userBasicData[6] != null) {
                        builder.dateOfBirth(userBasicData[6].toString());
                    }
                }
                
                // Fetch default address separately
                List<?> addressDataList = entityManager.createQuery(
                    "SELECT a.street, a.commune, a.district, a.city " +
                    "FROM UserAddress ua JOIN ua.address a WHERE ua.user.id = :userId AND ua.isDefault = true")
                    .setParameter("userId", userId)
                    .setMaxResults(1)
                    .getResultList();
                
                if (!addressDataList.isEmpty()) {
                    Object[] addr = (Object[]) addressDataList.get(0);
                    String address = String.format("%s, %s, %s, %s", 
                        addr[0] != null ? addr[0] : "",
                        addr[1] != null ? addr[1] : "",
                        addr[2] != null ? addr[2] : "",
                        addr[3] != null ? addr[3] : "");
                    builder.address(address);
                }
            } catch (Exception e) {
                // Log error but continue building DTO
                System.err.println("Error loading user data: " + e.getMessage());
            }
        }
        
        // Safely load shipping company info
        if (shipper.getShippingCompany() != null) {
            builder.shippingCompanyId(shipper.getShippingCompany().getId())
                   .shippingCompanyName(shipper.getShippingCompany().getName());
        }
        
        return builder.build();
    }
    
    // Helper method: Kiểm tra quyền truy cập của manager
    private void validateManagerAccess(User currentUser, Shipper shipper) {
        UUID managerCompanyId = getManagerCompanyId(currentUser);
        if (managerCompanyId != null) {
            UUID shipperCompanyId = shipper.getShippingCompany() != null 
                    ? shipper.getShippingCompany().getId() 
                    : null;
            
            if (shipperCompanyId == null || !managerCompanyId.equals(shipperCompanyId)) {
                throw new IllegalArgumentException("Manager chỉ có thể quản lý shipper của công ty mình");
            }
        }
    }
    
    // Helper method: Lấy ShippingCompany của manager
    private UUID getManagerCompanyId(User currentUser) {
        if (currentUser == null) {
            return null;
        }
        
        // Kiểm tra role MANAGER
        boolean isManager = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("MANAGER"));
        
        if (!isManager) {
            return null;
        }
        
        // Lấy Manager entity
        Manager manager = managerRepository.findByUser(currentUser)
                .orElse(null);
        
        return manager != null && manager.getShippingCompany() != null 
                ? manager.getShippingCompany().getId() 
                : null;
    }
}
