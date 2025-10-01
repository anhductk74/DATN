package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AddressRespository extends JpaRepository<Address, UUID> {
}
