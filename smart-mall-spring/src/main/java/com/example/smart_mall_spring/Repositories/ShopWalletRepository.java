package com.example.smart_mall_spring.Repositories;

import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Entities.Wallet.ShopWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopWalletRepository extends JpaRepository<ShopWallet, UUID> {
    Optional<ShopWallet> findByShop(Shop shop);
    Optional<ShopWallet> findByShopId(UUID shopId);
    boolean existsByShopId(UUID shopId);
}
