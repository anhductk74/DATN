package com.example.smart_mall_spring.Entities.Orders;
import com.example.smart_mall_spring.Entities.Users.User;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Date;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Mã giao dịch do hệ thống hoặc cổng thanh toán tạo ra
    @Column(nullable = false, unique = true)
    private String transactionCode;

    // Số tiền giao dịch
    @Column(nullable = false)
    private Double amount;

    // Mô tả giao dịch
    private String description;

    // Loại giao dịch: 1 = Nạp tiền, 2 = Thanh toán, 3 = Hoàn tiền
    @Column(nullable = false)
    private Integer transactionType;

    // Ngày tạo giao dịch
    @Column(nullable = false)
    private Date transactionDate;

    // Trạng thái: 0 = thất bại, 1 = thành công, 2 = đang xử lý
    @Column(nullable = false)
    private Integer status;

    // Tên ngân hàng / phương thức thanh toán
    private String bankTransactionName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}