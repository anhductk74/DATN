package com.example.smart_mall_spring.Services.Users;

import com.example.smart_mall_spring.Dtos.UserVoucher.UserVoucherResponseDto;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Users.UserVoucher;
import com.example.smart_mall_spring.Entities.Orders.Voucher;
import com.example.smart_mall_spring.Repositories.UserRepository;
import com.example.smart_mall_spring.Repositories.UserVoucherRepository;
import com.example.smart_mall_spring.Repositories.VoucherRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserVoucherService {

    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    /** 🔹 User sưu tầm voucher */
    public UserVoucherResponseDto collectVoucher(UUID userId, String voucherCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        // Kiểm tra nếu user đã sưu tầm voucher này rồi
        userVoucherRepository.findByUserAndVoucher(user, voucher)
                .ifPresent(v -> {
                    throw new RuntimeException("Voucher already collected by this user");
                });

        UserVoucher userVoucher = new UserVoucher();
        userVoucher.setUser(user);
        userVoucher.setVoucher(voucher);
        userVoucher.setUsed(false);
        userVoucher.setCollectedAt(LocalDateTime.now());

        UserVoucher saved = userVoucherRepository.save(userVoucher);
        return new UserVoucherResponseDto().mapToDto(saved);
    }

    /** 🔹 Lấy danh sách tất cả voucher user đã sưu tầm */
    public List<UserVoucherResponseDto> getUserVouchers(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userVoucherRepository.findByUser(user).stream()
                .map(v -> new UserVoucherResponseDto().mapToDto(v))
                .collect(Collectors.toList());
    }

    /** 🔹 Đánh dấu voucher đã dùng */
    public UserVoucherResponseDto useVoucher(UUID userId, String voucherCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        UserVoucher userVoucher = userVoucherRepository.findByUserAndVoucher(user, voucher)
                .orElseThrow(() -> new RuntimeException("User has not collected this voucher"));

        if (userVoucher.getUsed())
            throw new RuntimeException("Voucher already used");

        userVoucher.setUsed(true);
        userVoucher.setUsedAt(LocalDateTime.now());

        UserVoucher updated = userVoucherRepository.save(userVoucher);
        return new UserVoucherResponseDto().mapToDto(updated);
    }
}