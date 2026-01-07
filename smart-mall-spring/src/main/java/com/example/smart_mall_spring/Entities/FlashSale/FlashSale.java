package com.example.smart_mall_spring.Entities.FlashSale;

import com.example.smart_mall_spring.Entities.BaseEntity;
import com.example.smart_mall_spring.Entities.Shop;
import com.example.smart_mall_spring.Enum.Status;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "flash_sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"shop", "flashSaleItems"})
public class FlashSale extends BaseEntity {
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    @Column(nullable = false)
    private LocalDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    
    @Column(name = "banner_image")
    private String bannerImage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;
    
    @OneToMany(mappedBy = "flashSale", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<FlashSaleItem> flashSaleItems;
    
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    @Column(name = "display_priority")
    private Integer displayPriority = 0;
    
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return status == Status.APPROVED && 
               !isDeleted &&
               now.isAfter(startTime) && 
               now.isBefore(endTime);
    }
    
    public boolean isUpcoming() {
        LocalDateTime now = LocalDateTime.now();
        return status == Status.APPROVED && 
               !isDeleted &&
               now.isBefore(startTime);
    }
    
    public boolean isExpired() {
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(endTime);
    }
}
