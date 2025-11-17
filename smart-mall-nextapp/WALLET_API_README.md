# API Ví Điện Tử Shop (Shop Wallet System)

Hệ thống ví điện tử cho shop theo mô hình các trang thương mại điện tử phổ biến.

## 📋 Tổng quan

Hệ thống ví điện tử cho phép:
- Tự động tạo ví khi user tạo shop
- Tự động cập nhật số dư khi đơn hàng hoàn thành
- Cho phép shop yêu cầu rút tiền
- Admin xét duyệt yêu cầu rút tiền
- Theo dõi lịch sử giao dịch

## 🗂️ Cấu trúc Database

### Bảng `shop_wallets`
- `id`: UUID (Primary Key)
- `shop_id`: UUID (Foreign Key to shops)
- `balance`: Số dư hiện tại
- `total_earned`: Tổng tiền đã kiếm được
- `total_withdrawn`: Tổng tiền đã rút
- `pending_amount`: Số tiền đang chờ (từ đơn hàng chưa hoàn thành)
- `bank_name`: Tên ngân hàng
- `bank_account_number`: Số tài khoản
- `bank_account_name`: Tên chủ tài khoản
- `is_active`: Trạng thái ví

### Bảng `withdrawal_requests`
- `id`: UUID (Primary Key)
- `shop_id`: UUID (Foreign Key)
- `wallet_id`: UUID (Foreign Key)
- `amount`: Số tiền yêu cầu rút
- `status`: PENDING | APPROVED | REJECTED | COMPLETED
- `bank_name`, `bank_account_number`, `bank_account_name`: Thông tin ngân hàng
- `note`: Ghi chú của shop
- `admin_note`: Ghi chú của admin
- `processed_by`: Username admin xử lý
- `processed_at`: Thời gian xử lý

### Bảng `wallet_transactions`
- `id`: UUID (Primary Key)
- `wallet_id`: UUID (Foreign Key)
- `type`: ORDER_PAYMENT | WITHDRAWAL | REFUND | ADJUSTMENT
- `amount`: Số tiền giao dịch
- `balance_before`: Số dư trước giao dịch
- `balance_after`: Số dư sau giao dịch
- `order_id`: UUID (Foreign Key, nullable)
- `withdrawal_request_id`: UUID (Foreign Key, nullable)
- `description`: Mô tả
- `reference_code`: Mã tham chiếu

## 🔧 API Endpoints

### 1️⃣ Tạo ví cho shop với thông tin ngân hàng
**POST** `/api/wallets/shops/{shopId}`

**Quyền truy cập:** Shop Owner (chỉ chủ shop mới được tạo ví)

**Request Body:**
```json
{
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A"
}
```

**Validation:**
- Tất cả các trường đều bắt buộc
- Không được để trống

**Response:**
```json
{
  "id": "uuid",
  "shopId": "uuid",
  "shopName": "Tên shop",
  "balance": 0.0,
  "totalEarned": 0.0,
  "totalWithdrawn": 0.0,
  "pendingAmount": 0.0,
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A",
  "isActive": true,
  "createdAt": "2025-11-17T10:00:00",
  "updatedAt": "2025-11-17T10:00:00"
}
```

### 2️⃣ Lấy thông tin ví
**GET** `/api/wallets/shops/{shopId}`

**Quyền truy cập:** Admin hoặc Shop Owner

**Response:**
```json
{
  "id": "uuid",
  "shopId": "uuid",
  "shopName": "Tên shop",
  "balance": 1500000.0,
  "totalEarned": 2000000.0,
  "totalWithdrawn": 500000.0,
  "pendingAmount": 300000.0,
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A",
  "isActive": true,
  "createdAt": "2025-11-17T10:00:00",
  "updatedAt": "2025-11-17T15:30:00"
}
```

### 3️⃣ Cập nhật thông tin ngân hàng
**PUT** `/api/wallets/shops/{shopId}/bank-info`

**Quyền truy cập:** Shop Owner

**Request Body:**
```json
{
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A"
}
```

**Response:** Thông tin ví đã cập nhật

### 4️⃣ Tạo yêu cầu rút tiền
**POST** `/api/wallets/shops/{shopId}/withdrawal-requests`

**Quyền truy cập:** Shop Owner

**Request Body:**
```json
{
  "amount": 500000,
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A",
  "note": "Rút tiền cuối tháng"
}
```

**Validation:**
- `amount`: Tối thiểu 50,000 VNĐ
- `amount`: Không được vượt quá số dư khả dụng

**Response:**
```json
{
  "id": "uuid",
  "shopId": "uuid",
  "shopName": "Tên shop",
  "walletId": "uuid",
  "amount": 500000,
  "status": "PENDING",
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A",
  "note": "Rút tiền cuối tháng",
  "adminNote": null,
  "processedBy": null,
  "processedAt": null,
  "createdAt": "2025-11-17T10:00:00",
  "updatedAt": "2025-11-17T10:00:00"
}
```

### 5️⃣ Lấy danh sách yêu cầu rút tiền của shop
**GET** `/api/wallets/shops/{shopId}/withdrawal-requests?page=0&size=10`

**Quyền truy cập:** Admin hoặc Shop Owner

**Query Parameters:**
- `page`: Trang (mặc định: 0)
- `size`: Số lượng (mặc định: 10)

**Response:** Page của WithdrawalResponse

### 6️⃣ Admin: Lấy tất cả yêu cầu rút tiền
**GET** `/api/wallets/withdrawal-requests?status=PENDING&page=0&size=10`

**Quyền truy cập:** Admin

**Query Parameters:**
- `status`: PENDING | APPROVED | REJECTED | COMPLETED (mặc định: PENDING)
- `page`: Trang (mặc định: 0)
- `size`: Số lượng (mặc định: 10)

**Response:** Page của WithdrawalResponse

### 7️⃣ Admin: Xử lý yêu cầu rút tiền
**PUT** `/api/wallets/withdrawal-requests/{requestId}/process`

**Quyền truy cập:** Admin

**Request Body:**
```json
{
  "status": "APPROVED",
  "adminNote": "Đã xác nhận chuyển khoản"
}
```

**Status values:**
- `APPROVED`: Phê duyệt (tự động chuyển sang COMPLETED và trừ tiền từ ví)
- `REJECTED`: Từ chối

**Response:** WithdrawalResponse đã cập nhật

### 8️⃣ Lấy lịch sử giao dịch
**GET** `/api/wallets/shops/{shopId}/transactions?page=0&size=20`

**Quyền truy cập:** Admin hoặc Shop Owner

**Query Parameters:**
- `page`: Trang (mặc định: 0)
- `size`: Số lượng (mặc định: 20)

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "walletId": "uuid",
      "type": "ORDER_PAYMENT",
      "amount": 150000,
      "balanceBefore": 0.0,
      "balanceAfter": 150000,
      "orderId": "uuid",
      "withdrawalRequestId": null,
      "description": "Thanh toán từ đơn hàng #...",
      "referenceCode": "...",
      "createdAt": "2025-11-17T10:00:00"
    }
  ],
  "totalPages": 1,
  "totalElements": 1,
  "size": 20,
  "number": 0
}
```

### 9️⃣ Lấy thống kê ví
**GET** `/api/wallets/shops/{shopId}/statistics`

**Quyền truy cập:** Admin hoặc Shop Owner

**Response:**
```json
{
  "balance": 1500000,
  "totalEarned": 2000000,
  "totalWithdrawn": 500000,
  "pendingAmount": 300000,
  "availableForWithdrawal": 1500000
}
```

### 🔟 Xem ví tạm (khi chưa tạo ví chính)
**GET** `/api/wallets/shops/{shopId}/temporary`

**Quyền truy cập:** Admin hoặc Shop Owner

**Response:**
```json
{
  "temporaryWallets": [
    {
      "id": "uuid",
      "shopId": "uuid",
      "shopName": "Tên shop",
      "orderId": "uuid",
      "amount": 500000,
      "isTransferred": false,
      "transferredAt": null,
      "note": "Đơn hàng hoàn thành khi shop chưa có ví",
      "createdAt": "2025-11-17T10:00:00"
    }
  ],
  "totalAmount": 1500000,
  "count": 3,
  "message": "Đây là tiền từ các đơn hàng đã hoàn thành khi shop chưa có ví. Tạo ví để nhận tiền này."
}
```

## 🔄 Luồng hoạt động

### 1. Khi tạo shop
```
User tạo shop → ShopService.createShop() 
→ Shop được tạo KHÔNG có ví
→ User phải chủ động tạo ví với thông tin ngân hàng
```

### 2. Khi shop owner tạo ví
```
Shop owner gọi POST /api/wallets/shops/{shopId}
→ Cung cấp thông tin ngân hàng cá nhân
→ WalletService.createWallet()
→ Validate thông tin ngân hàng
→ Kiểm tra có ví tạm không
→ Nếu có ví tạm:
   - Tạo ví với balance = tổng tiền từ ví tạm
   - Chuyển tất cả tiền từ ví tạm sang ví chính
   - Tạo transaction cho từng đơn hàng
   - Đánh dấu ví tạm đã chuyển
→ Nếu không có ví tạm:
   - Tạo ví với balance = 0
```

### 3. Khi đơn hàng được tạo
```
OrderService.createOrder()
→ WalletService.addPendingAmount()
→ Nếu shop có ví: Tăng pendingAmount
→ Nếu shop chưa có ví: Bỏ qua (log warning)
```

### 4. Khi đơn hàng hoàn thành (DELIVERED)
```
OrderService.updateOrderStatus(DELIVERED)
→ WalletService.addOrderPayment()
→ Nếu shop có ví:
   - balance += finalAmount
   - totalEarned += finalAmount
   - pendingAmount -= finalAmount
   - Tạo WalletTransaction (ORDER_PAYMENT)
→ Nếu shop chưa có ví:
   - Lưu vào TemporaryWallet
   - Tiền được bảo toàn, chờ tạo ví
```

### 5. Khi đơn hàng bị hủy
```
OrderService.updateOrderStatus(CANCELLED)
→ WalletService.removePendingAmount()
→ Nếu shop có ví: pendingAmount -= finalAmount
→ Nếu shop chưa có ví: Bỏ qua (log warning)
```

### 6. Khi shop yêu cầu rút tiền
```
Shop gửi request → WalletService.createWithdrawalRequest()
→ Kiểm tra shop đã có ví chưa
→ Kiểm tra balance >= amount
→ Tạo WithdrawalRequest (status: PENDING)
```

### 7. Khi admin xử lý rút tiền
```
Admin approve → WalletService.processWithdrawalRequest()
→ balance -= amount
→ totalWithdrawn += amount
→ Tạo WalletTransaction (WITHDRAWAL)
→ status: COMPLETED
```

## ⚠️ Lưu ý quan trọng

### 🔴 Hệ thống Ví Tạm (Temporary Wallet)
- Khi tạo shop, hệ thống **KHÔNG tự động tạo ví**
- Nếu shop chưa có ví:
  - Đơn hàng vẫn hoạt động bình thường
  - Tiền từ đơn hàng **ĐƯỢC LƯU VÀO VÍ TẠM** (không bị mất)
  - Khi shop tạo ví chính, **TẤT CẢ TIỀN TỪ VÍ TẠM** sẽ được chuyển tự động
- Ví tạm lưu từng đơn hàng hoàn thành khi shop chưa có ví

### ✅ Lợi ích của Ví Tạm
- **Không mất tiền:** Tiền từ đơn hàng được bảo toàn trong ví tạm
- **Linh hoạt:** Shop có thể tạo ví bất cứ lúc nào
- **Tự động chuyển:** Khi tạo ví, tiền tự động chuyển từ ví tạm sang ví chính
- **Theo dõi được:** Có thể xem chi tiết các giao dịch trong ví tạm

### 💡 Khuyến nghị
- Nên tạo ví ngay sau khi tạo shop để quản lý tiền tốt hơn
- Kiểm tra ví tạm để biết có bao nhiêu tiền đang chờ

### 📌 Các quy định khác
1. **Số dư khả dụng = balance** (không bao gồm pendingAmount)
2. **Số tiền rút tối thiểu:** 50,000 VNĐ
3. **Khi APPROVED:** Tự động chuyển sang COMPLETED và trừ tiền
4. **Thông tin ngân hàng:** Bắt buộc khi tạo ví, có thể cập nhật sau
5. **Transaction types:**
   - `ORDER_PAYMENT`: Thanh toán từ đơn hàng
   - `WITHDRAWAL`: Rút tiền
   - `REFUND`: Hoàn tiền (chưa implement)
   - `ADJUSTMENT`: Điều chỉnh bởi admin (chưa implement)

## 🔐 Phân quyền

- **Shop Owner:** 
  - Xem ví của shop mình
  - Cập nhật thông tin ngân hàng
  - Tạo yêu cầu rút tiền
  - Xem lịch sử giao dịch và yêu cầu rút tiền

- **Admin:**
  - Tất cả quyền của Shop Owner
  - Xem tất cả ví và yêu cầu rút tiền
  - Xử lý (approve/reject) yêu cầu rút tiền

## 📊 Ví dụ sử dụng

### Ví dụ 0: Tạo ví cho shop mới (BẮT BUỘC)
```bash
# 1. User vừa tạo shop
POST /api/shops
# Nhận được shopId

# 2. Tạo ví cho shop với thông tin ngân hàng cá nhân
POST /api/wallets/shops/{shopId}
{
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A"
}

# 3. Kiểm tra ví đã tạo thành công
GET /api/wallets/shops/{shopId}
# balance = 0, ready to receive payments
```

### Ví dụ 1: Shop rút tiền
```bash
# 1. Lấy thông tin ví
GET /api/wallets/shops/{shopId}

# 2. Kiểm tra số dư (balance)
# balance = 1,500,000 VNĐ

# 3. Tạo yêu cầu rút tiền
POST /api/wallets/shops/{shopId}/withdrawal-requests
{
  "amount": 1000000,
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankAccountName": "NGUYEN VAN A"
}

# 4. Chờ admin xử lý
# Status: PENDING

# 5. Admin approve
PUT /api/wallets/withdrawal-requests/{requestId}/process
{
  "status": "APPROVED",
  "adminNote": "Đã chuyển khoản"
}

# 6. Kiểm tra lại số dư
GET /api/wallets/shops/{shopId}
# balance = 500,000 VNĐ (1,500,000 - 1,000,000)
```

### Ví dụ 2: Theo dõi giao dịch
```bash
# Xem lịch sử giao dịch
GET /api/wallets/shops/{shopId}/transactions?page=0&size=20

# Kết quả sẽ hiển thị:
# - Các khoản thanh toán từ đơn hàng
# - Các lần rút tiền
# - Balance trước và sau mỗi giao dịch
```

## 🛠️ Cài đặt

Hệ thống đã được tích hợp sẵn vào project. Cần đảm bảo:

1. **Database migration:** Chạy application để tự động tạo bảng
2. **Quyền truy cập:** Cấu hình Spring Security phù hợp
3. **OrderService dependency:** Đã inject WalletService

## 🔔 Thay đổi quan trọng so với phiên bản cũ

### ❌ KHÔNG còn tự động tạo ví
- Phiên bản cũ: Tạo shop → Tự động tạo ví
- **Phiên bản mới: Tạo shop → User phải TỰ tạo ví với thông tin ngân hàng**

### ✅ Lợi ích của thay đổi
1. **Bảo mật hơn:** User tự xác nhận thông tin ngân hàng
2. **Tuân thủ quy định:** Xác thực thông tin tài khoản ngân hàng
3. **Linh hoạt:** User có thể chọn thời điểm tạo ví
4. **Tránh lỗi:** Không tự động tạo ví với thông tin null

## 📝 TODO (Tính năng mở rộng)

- [ ] Tự động rút tiền định kỳ
- [ ] Email thông báo khi yêu cầu rút tiền được xử lý
- [ ] Export báo cáo giao dịch (Excel/PDF)
- [ ] Dashboard thống kê thu nhập theo thời gian
- [ ] Hỗ trợ nhiều tài khoản ngân hàng
- [ ] Hoàn tiền tự động khi đơn hàng bị trả lại
- [ ] Phí giao dịch/dịch vụ
- [ ] Tích hợp API chuyển khoản tự động
