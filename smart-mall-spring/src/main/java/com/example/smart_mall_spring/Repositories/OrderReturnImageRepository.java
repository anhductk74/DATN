package com.example.smart_mall_spring.Repositories;


import com.example.smart_mall_spring.Entities.Orders.OrderReturnImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderReturnImageRepository extends JpaRepository<OrderReturnImage, UUID> {

    @Query("SELECT i FROM OrderReturnImage i WHERE i.orderReturnRequest.id = :returnRequestId")
    List<OrderReturnImage> findByReturnRequestId(UUID returnRequestId);

    @Query("SELECT i FROM OrderReturnImage i WHERE i.publicId = :publicId")
    OrderReturnImage findByPublicId(String publicId);
}