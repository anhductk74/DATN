package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Users.UserVoucher;
import com.example.smart_mall_spring.Entities.Users.User;
import com.example.smart_mall_spring.Entities.Orders.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, UUID> {

    List<UserVoucher> findByUser(User user);

    Optional<UserVoucher> findByUserAndVoucher(User user, Voucher voucher);

    List<UserVoucher> findByUserAndUsedFalse(User user);

    List<UserVoucher> findByUserAndUsedTrue(User user);
}