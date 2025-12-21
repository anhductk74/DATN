# Sơ đồ Use Case và Đặc tả cho Actor ADMIN (Quản trị viên hệ thống)

## 1. Sơ đồ Use Case

```
                                    ┌─────────────────────────────────┐
                                    │   Hệ thống Smart Mall           │
                                    │      (Full Access)              │
                                    └─────────────────────────────────┘
                                                    │
        ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
        │                                           │                                           │
    ┌───▼────┐                                      │                                           │
    │Đăng    │                                      │                                           │
    │nhập    │                              ┌───────▼─────────┐                                 │
    └────────┘                              │                 │         ┌──────────────┐        │
                                            │                 │◄────────┤Quản lý người │        │
    ┌──────────┐                            │                 │         │dùng          │        │
    │Quản lý   │◄───────────────────────────┤                 │         └──────────────┘        │
    │người dùng│                            │                 │                                 │
    └──────────┘                            │                 │         ┌──────────────┐        │
        │                                   │      ADMIN      │◄────────┤Thêm/Sửa/Xóa  │        │
    ┌───▼────┐                              │                 │         │user          │        │
    │Xem danh│                              │                 │         └──────────────┘        │
    │sách user                               │                 │                                 │
    └────────┘                              │                 │         ┌──────────────┐        │
        │                                   │                 │◄────────┤Phân quyền    │        │
    ┌───▼────┐                              │                 │         │user          │        │
    │Kích hoạt│                              │                 │         └──────────────┘        │
    │/Vô hiệu│                              │                 │                                 │
    │hóa user│                              │                 │         ┌──────────────┐        │
    └────────┘                              │                 │◄────────┤Quản lý danh  │        │
                                            │                 │         │mục           │        │
    ┌──────────┐                            │                 │         └──────────────┘        │
    │Quản lý   │◄───────────────────────────┤                 │                                 │
    │danh mục  │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Quản lý shop  │        │
        │                                   │                 │         └──────────────┘        │
    ┌───▼────┐                              │                 │                                 │
    │Thêm/Sửa│                              │                 │         ┌──────────────┐        │
    │/Xóa    │                              │                 │◄────────┤Duyệt sản phẩm│        │
    │category│                              │                 │         │mới           │        │
    └────────┘                              │                 │         └──────────────┘        │
                                            │                 │                                 │
    ┌──────────┐                            │                 │         ┌──────────────┐        │
    │Quản lý   │◄───────────────────────────┤                 │◄────────┤Quản lý sản   │        │
    │sản phẩm  │                            │                 │         │phẩm          │        │
    └──────────┘                            │                 │         └──────────────┘        │
        │                                   │                 │                                 │
    ┌───▼────┐                              │                 │         ┌──────────────┐        │
    │Xem tất │                              │                 │◄────────┤Quản lý đơn   │        │
    │cả sản  │                              │                 │         │hàng          │        │
    │phẩm    │                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Xử lý yêu cầu │        │
    │Duyệt/  │                              │                 │         │hoàn trả      │        │
    │Từ chối │                              │                 │         └──────────────┘        │
    │sản phẩm│                              │                 │                                 │
    └────────┘                              │                 │         ┌──────────────┐        │
                                            │                 │◄────────┤Quản lý voucher        │
    ┌──────────┐                            │                 │         └──────────────┘        │
    │Quản lý   │◄───────────────────────────┤                 │                                 │
    │đơn hàng  │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Quản lý ví shop        │
        │                                   │                 │         └──────────────┘        │
    ┌───▼────┐                              │                 │                                 │
    │Xem tất │                              │                 │         ┌──────────────┐        │
    │cả đơn  │                              │                 │◄────────┤Duyệt rút tiền│        │
    │hàng    │                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Quản lý vận   │        │
    │Can thiệp│                              │                 │         │chuyển        │        │
    │đơn hàng│                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Quản lý công ty        │
    │Quản lý   │◄───────────────────────────┤                 │         │vận chuyển    │        │
    │hoàn trả  │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Tạo Manager   │        │
    │Duyệt/  │                              │                 │         └──────────────┘        │
    │Từ chối │                              │                 │                                 │
    │yêu cầu │                              │                 │         ┌──────────────┐        │
    └────────┘                              │                 │◄────────┤Xem tất cả    │        │
                                            │                 │         │thống kê      │        │
    ┌──────────┐                            │                 │         └──────────────┘        │
    │Quản lý   │◄───────────────────────────┤                 │                                 │
    │voucher   │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Xem dashboard │        │
        │                                   │                 │         │tổng quan     │        │
    ┌───▼────┐                              │                 │         └──────────────┘        │
    │Tạo/Sửa/│                              │                 │                                 │
    │Xóa/Vô  │                              │                 │         ┌──────────────┐        │
    │hiệu hóa│                              │                 │◄────────┤Quản lý đánh  │        │
    │voucher │                              │                 │         │giá           │        │
    └────────┘                              │                 │         └──────────────┘        │
                                            │                 │                                 │
    ┌──────────┐                            │                 │         ┌──────────────┐        │
    │Quản lý   │◄───────────────────────────┤                 │◄────────┤Quản lý cấu   │        │
    │ví shop   │                            │                 │         │hình hệ thống │        │
    └──────────┘                            │                 │         └──────────────┘        │
        │                                   │                 │                                 │
    ┌───▼────┐                              └─────────────────┘                                 │
    │Xem tất │                                                                                  │
    │cả ví   │                                                                                  │
    └────────┘                                                                                  │
        │                                                                                       │
    ┌───▼────┐                                                                                  │
    │Duyệt rút                                                                                   │
    │tiền shop                                                                                   │
    └────────┘                                                                                  │
                                                                                                │
    ┌──────────┐                                                                                │
    │Quản lý   │                                                                                │
    │Express   │                                                                                │
    │Manager   │                                                                                │
    └──────────┘                                                                                │
        │                                                                                       │
    ┌───▼────┐                                                                                  │
    │Tạo     │                                                                                  │
    │Manager │                                                                                  │
    └────────┘                                                                                  │
                                                                                                │
    ┌──────────┐                                                                                │
    │Quản lý   │                                                                                │
    │shipping  │                                                                                │
    │company   │                                                                                │
    └──────────┘                                                                                │
                                                                                                │
    ┌──────────┐                                                                                │
    │Xem báo   │                                                                                │
    │cáo toàn  │                                                                                │
    │hệ thống  │                                                                                │
    └──────────┘                                                                                │
                                                                                                │
    ┌──────────┐                                                                                │
    │Quản lý   │                                                                                │
    │đánh giá  │                                                                                │
    └──────────┘                                                                                │
                                                                                                │
    ┌──────────┐                                                                                │
    │Cấu hình  │                                                                                │
    │hệ thống  │                                                                                │
    └──────────┘                                                                                │
                                    ┌───────────────────────────────────────────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │  All Subsystems│
                            │  (Full Control)│
                            └────────────────┘
```

## 2. Đặc tả Use Case theo cấu trúc

### 2.1 Đăng nhập

| Tên usecase | Đăng nhập |
|-------------|-----------|
| **Mục đích** | Cho phép Admin đăng nhập vào hệ thống với quyền cao nhất. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin đăng nhập để quản lý toàn bộ hệ thống Smart Mall. |
| **Các quy tắc nghiệp vụ** | - Tài khoản phải có role ADMIN.<br>- JWT token với quyền cao nhất.<br>- Có quyền truy cập mọi module.<br>- Session timeout dài hơn user thường (12 giờ).<br>- Log tất cả hoạt động của admin. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập trang đăng nhập admin.<br>2. Bước 1: Nhập username và password.<br>3. Bước 2: Hệ thống xác thực và kiểm tra role = ADMIN.<br>4. Bước 3: Trả về JWT token với full permissions.<br>5. Bước 4: Ghi log đăng nhập.<br>6. Kết thúc: Chuyển đến admin dashboard. |

### 2.2 Quản lý người dùng

| Tên usecase | Quản lý người dùng |
|-------------|--------------------|
| **Mục đích** | Cho phép Admin quản lý tất cả người dùng trong hệ thống. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem, thêm, sửa, xóa và quản lý quyền của tất cả user. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả user không phân biệt role.<br>- Lọc theo role: USER, ADMIN, SHOP_OWNER, SHIPPER, MANAGER.<br>- Tìm kiếm theo tên, email, username.<br>- Phân trang danh sách.<br>- Xem chi tiết profile từng user.<br>- Có quyền thay đổi role user. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý người dùng.<br>2. Bước 1: Hệ thống lấy tất cả user với phân trang.<br>3. Bước 2: Admin chọn bộ lọc (role, status).<br>4. Bước 3: Hiển thị danh sách user.<br>5. Bước 4: Admin chọn user để xem chi tiết hoặc chỉnh sửa.<br>6. Kết thúc: Thực hiện các thao tác quản lý. |

### 2.3 Thêm/Sửa/Xóa user

| Tên usecase | Thêm/Sửa/Xóa user |
|-------------|-------------------|
| **Mục đích** | Cho phép Admin tạo, chỉnh sửa hoặc xóa tài khoản người dùng. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin có quyền cao nhất trong việc quản lý tài khoản user. |
| **Các quy tắc nghiệp vụ** | - Tạo user với bất kỳ role nào.<br>- Cập nhật thông tin: username, email, profile, roles.<br>- Soft delete user (đánh dấu deletedAt).<br>- Khôi phục user đã xóa.<br>- Gửi email thông báo cho user khi có thay đổi.<br>- Log tất cả thao tác. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin chọn thao tác với user.<br>2. Bước 1 (Thêm): Điền thông tin user mới, chọn roles.<br>3. Bước 2 (Sửa): Cập nhật thông tin user hiện tại.<br>4. Bước 3 (Xóa): Xác nhận và soft delete user.<br>5. Bước 4: Hệ thống thực hiện thao tác.<br>6. Bước 5: Gửi email notification.<br>7. Bước 6: Ghi log.<br>8. Kết thúc: User được tạo/sửa/xóa. |

### 2.4 Phân quyền user

| Tên usecase | Phân quyền user |
|-------------|-----------------|
| **Mục đích** | Cho phép Admin thay đổi role/quyền của user. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin cấp hoặc thu hồi các role từ user. |
| **Các quy tắc nghiệp vụ** | - Có thể cấp nhiều role cho một user.<br>- Các role: USER, ADMIN, SHOP_OWNER, SHIPPER, MANAGER.<br>- Thay đổi role ảnh hưởng đến permissions.<br>- Ghi log mọi thay đổi role.<br>- Gửi email thông báo cho user. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin chọn user cần phân quyền.<br>2. Bước 1: Xem roles hiện tại của user.<br>3. Bước 2: Chọn thêm/xóa roles.<br>4. Bước 3: Xác nhận thay đổi.<br>5. Bước 4: Hệ thống cập nhật user_roles.<br>6. Bước 5: Ghi log thay đổi.<br>7. Bước 6: Gửi email notification.<br>8. Kết thúc: Quyền user được cập nhật. |

### 2.5 Kích hoạt/Vô hiệu hóa user

| Tên usecase | Kích hoạt/Vô hiệu hóa user |
|-------------|----------------------------|
| **Mục đích** | Cho phép Admin bật/tắt tài khoản user. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin thay đổi trạng thái isActive của user. |
| **Các quy tắc nghiệp vụ** | - isActive = true: user có thể đăng nhập.<br>- isActive = false: user bị khóa tài khoản.<br>- Phải có lý do khi vô hiệu hóa.<br>- User bị khóa không thể đăng nhập.<br>- Gửi email thông báo.<br>- Ghi log. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin chọn user cần thay đổi trạng thái.<br>2. Bước 1: Xem trạng thái hiện tại.<br>3. Bước 2: Chọn Active/Inactive.<br>4. Bước 3: Nhập lý do (nếu Inactive).<br>5. Bước 4: Cập nhật isActive trong database.<br>6. Bước 5: Gửi email cho user.<br>7. Bước 6: Ghi log.<br>8. Kết thúc: Trạng thái user thay đổi. |

### 2.6 Quản lý danh mục

| Tên usecase | Quản lý danh mục |
|-------------|------------------|
| **Mục đích** | Cho phép Admin quản lý danh mục sản phẩm. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin tạo, sửa, xóa danh mục và danh mục con (hierarchical). |
| **Các quy tắc nghiệp vụ** | - Hỗ trợ cấu trúc phân cấp (parent-child).<br>- Mỗi category có: name, description, parent.<br>- Có thể upload icon cho category.<br>- Soft delete category.<br>- Khi xóa category cha, xử lý các category con.<br>- Sản phẩm thuộc category bị xóa sẽ chuyển về Uncategorized. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý danh mục.<br>2. Bước 1: Hiển thị cây danh mục.<br>3. Bước 2: Admin chọn thao tác: thêm/sửa/xóa.<br>4. Bước 3: Thực hiện thao tác với validation.<br>5. Bước 4: Cập nhật database.<br>6. Kết thúc: Danh mục được cập nhật. |

### 2.7 Quản lý shop

| Tên usecase | Quản lý shop |
|-------------|--------------|
| **Mục đích** | Cho phép Admin quản lý tất cả cửa hàng trong hệ thống. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem, duyệt, sửa, xóa và giám sát các shop. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả shop không phân biệt owner.<br>- Duyệt shop mới đăng ký (nếu có workflow approval).<br>- Vô hiệu hóa shop vi phạm.<br>- Xem thống kê doanh thu từng shop.<br>- Cập nhật thông tin shop thay shop owner.<br>- Xóa shop (soft delete). |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý shop.<br>2. Bước 1: Xem danh sách tất cả shop.<br>3. Bước 2: Lọc theo status, owner, doanh thu.<br>4. Bước 3: Chọn shop để xem chi tiết.<br>5. Bước 4: Thực hiện thao tác quản lý.<br>6. Kết thúc: Shop được cập nhật. |

### 2.8 Quản lý sản phẩm

| Tên usecase | Quản lý sản phẩm |
|-------------|------------------|
| **Mục đích** | Cho phép Admin quản lý tất cả sản phẩm trong hệ thống. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem, duyệt, sửa, xóa sản phẩm của tất cả shop. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả sản phẩm bao gồm cả đã xóa.<br>- Duyệt sản phẩm mới (nếu có approval workflow).<br>- Từ chối sản phẩm vi phạm chính sách.<br>- Cập nhật thông tin sản phẩm.<br>- Xóa sản phẩm vi phạm.<br>- Khôi phục sản phẩm đã xóa. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý sản phẩm.<br>2. Bước 1: Xem tất cả sản phẩm với filter.<br>3. Bước 2: Lọc theo shop, category, status.<br>4. Bước 3: Xem chi tiết sản phẩm.<br>5. Bước 4: Thực hiện thao tác: duyệt/từ chối/sửa/xóa.<br>6. Kết thúc: Sản phẩm được cập nhật. |

### 2.9 Duyệt sản phẩm mới

| Tên usecase | Duyệt sản phẩm mới |
|-------------|--------------------|
| **Mục đích** | Cho phép Admin phê duyệt sản phẩm mới trước khi hiển thị công khai. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem xét và approve/reject sản phẩm mới đăng. |
| **Các quy tắc nghiệp vụ** | - Sản phẩm mới có status PENDING_APPROVAL.<br>- Admin kiểm tra: hình ảnh, mô tả, giá cả, danh mục.<br>- Approve: chuyển status → ACTIVE.<br>- Reject: chuyển status → REJECTED, ghi lý do.<br>- Gửi notification cho shop owner.<br>- Tạo approval log. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin xem danh sách sản phẩm PENDING_APPROVAL.<br>2. Bước 1: Chọn sản phẩm để xem xét.<br>3. Bước 2: Xem chi tiết: hình ảnh, mô tả, giá.<br>4. Bước 3: Kiểm tra vi phạm chính sách.<br>5. Bước 4: Chọn APPROVE hoặc REJECT.<br>6. Bước 5: Nếu REJECT, nhập lý do.<br>7. Bước 6: Cập nhật status sản phẩm.<br>8. Bước 7: Gửi notification cho shop.<br>9. Bước 8: Tạo approval log.<br>10. Kết thúc: Sản phẩm được duyệt/từ chối. |

### 2.10 Quản lý đơn hàng

| Tên usecase | Quản lý đơn hàng |
|-------------|------------------|
| **Mục đích** | Cho phép Admin xem và can thiệp vào tất cả đơn hàng. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin giám sát và xử lý các vấn đề về đơn hàng. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả đơn hàng của hệ thống.<br>- Lọc theo: status, shop, user, ngày.<br>- Xem chi tiết từng đơn hàng.<br>- Can thiệp khi có tranh chấp.<br>- Cập nhật trạng thái đơn hàng.<br>- Hủy đơn hàng bất thường.<br>- Export báo cáo đơn hàng. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý đơn hàng.<br>2. Bước 1: Xem tất cả đơn hàng với phân trang.<br>3. Bước 2: Áp dụng filter cần thiết.<br>4. Bước 3: Xem chi tiết đơn hàng.<br>5. Bước 4: Can thiệp nếu cần (hủy, hoàn tiền, etc).<br>6. Kết thúc: Đơn hàng được xử lý. |

### 2.11 Xử lý yêu cầu hoàn trả

| Tên usecase | Xử lý yêu cầu hoàn trả |
|-------------|------------------------|
| **Mục đích** | Cho phép Admin can thiệp vào các yêu cầu hoàn trả/tranh chấp. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem xét và phân xử các case hoàn trả phức tạp. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả return request của hệ thống.<br>- Can thiệp khi shop từ chối bất hợp lý.<br>- Xem bằng chứng từ khách và shop.<br>- Quyết định cuối cùng: APPROVED/REJECTED.<br>- Xử lý hoàn tiền cho khách.<br>- Phạt shop nếu sai phạm.<br>- Ghi log quyết định. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin xem danh sách return requests.<br>2. Bước 1: Lọc case cần can thiệp (disputed).<br>3. Bước 2: Xem chi tiết: lý do, hình ảnh, phản hồi shop.<br>4. Bước 3: Đánh giá bằng chứng từ 2 bên.<br>5. Bước 4: Ra quyết định cuối cùng.<br>6. Bước 5: Xử lý hoàn tiền nếu approve.<br>7. Bước 6: Gửi notification cho cả 2 bên.<br>8. Bước 7: Ghi log.<br>9. Kết thúc: Case được giải quyết. |

### 2.12 Quản lý voucher

| Tên usecase | Quản lý voucher |
|-------------|-----------------|
| **Mục đích** | Cho phép Admin quản lý tất cả mã giảm giá hệ thống. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin tạo, sửa, xóa và quản lý voucher toàn hệ thống. |
| **Các quy tắc nghiệp vụ** | - Tạo voucher áp dụng cho toàn hệ thống.<br>- Cấu hình: mã, loại giảm giá, giá trị, điều kiện.<br>- Đặt thời hạn sử dụng.<br>- Giới hạn số lượt dùng.<br>- Vô hiệu hóa voucher khi cần.<br>- Xem thống kê sử dụng voucher. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý voucher.<br>2. Bước 1: Xem danh sách voucher hiện có.<br>3. Bước 2: Chọn tạo voucher mới.<br>4. Bước 3: Cấu hình: code, discountType, value, conditions.<br>5. Bước 4: Đặt thời hạn và số lượng.<br>6. Bước 5: Lưu voucher.<br>7. Kết thúc: Voucher có thể sử dụng. |

### 2.13 Quản lý ví shop

| Tên usecase | Quản lý ví shop |
|-------------|-----------------|
| **Mục đích** | Cho phép Admin giám sát và quản lý ví của tất cả shop. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem số dư, giao dịch và xử lý rút tiền của shop. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả wallet của mọi shop.<br>- Xem chi tiết giao dịch.<br>- Duyệt yêu cầu rút tiền.<br>- Từ chối rút tiền bất thường.<br>- Điều chỉnh số dư khi cần (với lý do).<br>- Xem báo cáo tài chính tổng thể. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý ví shop.<br>2. Bước 1: Xem danh sách wallet của tất cả shop.<br>3. Bước 2: Xem chi tiết wallet từng shop.<br>4. Bước 3: Xem lịch sử giao dịch.<br>5. Bước 4: Xử lý yêu cầu rút tiền pending.<br>6. Kết thúc: Wallet được giám sát. |

### 2.14 Duyệt rút tiền shop

| Tên usecase | Duyệt rút tiền shop |
|-------------|---------------------|
| **Mục đích** | Cho phép Admin phê duyệt hoặc từ chối yêu cầu rút tiền của shop. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem xét và approve/reject withdrawal requests. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả withdrawal requests PENDING.<br>- Kiểm tra số dư khả dụng của shop.<br>- Xác minh thông tin ngân hàng.<br>- Approve: chuyển tiền cho shop, cập nhật status → APPROVED.<br>- Reject: ghi lý do, status → REJECTED.<br>- Gửi notification cho shop.<br>- Ghi log transaction. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin xem withdrawal requests PENDING.<br>2. Bước 1: Chọn request để xem xét.<br>3. Bước 2: Xem số dư wallet và thông tin ngân hàng.<br>4. Bước 3: Kiểm tra tính hợp lệ.<br>5. Bước 4: Chọn APPROVE hoặc REJECT.<br>6. Bước 5: Nếu APPROVE, xử lý chuyển tiền.<br>7. Bước 6: Nếu REJECT, nhập lý do.<br>8. Bước 7: Cập nhật status request.<br>9. Bước 8: Gửi notification cho shop.<br>10. Kết thúc: Request được xử lý. |

### 2.15 Quản lý Express Manager

| Tên usecase | Quản lý Express Manager |
|-------------|-------------------------|
| **Mục đích** | Cho phép Admin quản lý các Manager của công ty vận chuyển. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin tạo, xóa và quản lý Manager accounts. |
| **Các quy tắc nghiệp vụ** | - Tạo Manager account và gắn với Shipping Company.<br>- Cấp quyền MANAGER cho user.<br>- Xóa Manager khi nghỉ việc.<br>- Xem danh sách tất cả Manager.<br>- Chuyển Manager sang company khác. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý Manager.<br>2. Bước 1: Xem danh sách Manager hiện có.<br>3. Bước 2: Chọn tạo Manager mới.<br>4. Bước 3: Chọn hoặc tạo User account.<br>5. Bước 4: Cấp role MANAGER.<br>6. Bước 5: Gắn với Shipping Company.<br>7. Bước 6: Lưu Manager record.<br>8. Kết thúc: Manager được tạo và có thể quản lý logistics. |

### 2.16 Quản lý shipping company

| Tên usecase | Quản lý shipping company |
|-------------|--------------------------|
| **Mục đích** | Cho phép Admin quản lý các đơn vị vận chuyển. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin tạo, sửa, xóa shipping company. |
| **Các quy tắc nghiệp vụ** | - Tạo shipping company mới.<br>- Cập nhật thông tin: tên, địa chỉ, liên hệ.<br>- Xóa company không còn hoạt động.<br>- Xem số lượng shipper của mỗi company.<br>- Xem hiệu suất vận chuyển từng company. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý shipping company.<br>2. Bước 1: Xem danh sách company.<br>3. Bước 2: Chọn tạo company mới hoặc sửa.<br>4. Bước 3: Điền/cập nhật thông tin.<br>5. Bước 4: Lưu company.<br>6. Kết thúc: Company được quản lý. |

### 2.17 Xem dashboard tổng quan

| Tên usecase | Xem dashboard tổng quan |
|-------------|-----------------------------|
| **Mục đích** | Cho phép Admin xem dashboard tổng quan toàn hệ thống. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem các KPI quan trọng của toàn bộ platform. |
| **Các quy tắc nghiệp vụ** | - Hiển thị tổng số: users, shops, products, orders.<br>- Doanh thu tổng và growth rate.<br>- Số đơn hàng theo trạng thái.<br>- Top shops bán chạy.<br>- Top products phổ biến.<br>- Biểu đồ xu hướng theo thời gian.<br>- Cảnh báo vấn đề cần xử lý. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin đăng nhập và vào dashboard.<br>2. Bước 1: Chọn khoảng thời gian xem.<br>3. Bước 2: Hệ thống tính toán tất cả KPI.<br>4. Bước 3: Hiển thị dashboard với biểu đồ.<br>5. Bước 4: Hiển thị alerts và notifications.<br>6. Kết thúc: Admin nắm được tình hình hệ thống. |

### 2.18 Quản lý đánh giá

| Tên usecase | Quản lý đánh giá |
|-------------|------------------|
| **Mục đích** | Cho phép Admin giám sát và xử lý các đánh giá sản phẩm. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem, xóa đánh giá vi phạm, xử lý report. |
| **Các quy tắc nghiệp vụ** | - Xem tất cả reviews trong hệ thống.<br>- Xóa review spam, toxic, vi phạm.<br>- Xử lý report về review từ shop/user.<br>- Xem thống kê rating trung bình.<br>- Cảnh báo shop có rating thấp. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập quản lý đánh giá.<br>2. Bước 1: Xem danh sách reviews mới nhất.<br>3. Bước 2: Lọc theo product, shop, rating.<br>4. Bước 3: Xem các review bị report.<br>5. Bước 4: Quyết định xóa nếu vi phạm.<br>6. Kết thúc: Review được kiểm duyệt. |

### 2.19 Xem báo cáo toàn hệ thống

| Tên usecase | Xem báo cáo toàn hệ thống |
|-------------|---------------------------|
| **Mục đích** | Cho phép Admin xem các báo cáo chi tiết về mọi khía cạnh. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin xem và export báo cáo tổng hợp. |
| **Các quy tắc nghiệp vụ** | - Báo cáo doanh thu tổng.<br>- Báo cáo người dùng mới.<br>- Báo cáo đơn hàng.<br>- Báo cáo hiệu suất vận chuyển.<br>- Báo cáo tài chính.<br>- Export PDF/Excel.<br>- Lên lịch báo cáo tự động. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập báo cáo.<br>2. Bước 1: Chọn loại báo cáo.<br>3. Bước 2: Chọn khoảng thời gian.<br>4. Bước 3: Hệ thống tổng hợp dữ liệu.<br>5. Bước 4: Hiển thị báo cáo với charts.<br>6. Bước 5: Export nếu cần.<br>7. Kết thúc: Báo cáo được tạo. |

### 2.20 Cấu hình hệ thống

| Tên usecase | Cấu hình hệ thống |
|-------------|-------------------|
| **Mục đích** | Cho phép Admin cấu hình các tham số hệ thống. |
| **Tác nhân** | Admin |
| **Mô tả** | Admin thay đổi settings, parameters của platform. |
| **Các quy tắc nghiệp vụ** | - Cấu hình phí platform (commission).<br>- Cấu hình phí vận chuyển mặc định.<br>- Cấu hình chính sách hoàn trả.<br>- Cấu hình email templates.<br>- Cấu hình payment gateways.<br>- Cấu hình SEO settings.<br>- Backup và restore data. |
| **Luồng Cơ bản** | 1. Mở đầu: Admin truy cập settings.<br>2. Bước 1: Xem các cấu hình hiện tại.<br>3. Bước 2: Chỉnh sửa parameters cần thiết.<br>4. Bước 3: Validate giá trị mới.<br>5. Bước 4: Lưu cấu hình.<br>6. Bước 5: Ghi log thay đổi.<br>7. Kết thúc: Hệ thống áp dụng config mới. |

---

## 3. API Endpoints cho Admin

### 3.1 User Management
- **GET** `/api/user/admin/users` - Xem tất cả user (có filter, phân trang)
- **POST** `/api/user/admin/users` - Tạo user mới
- **PUT** `/api/user/admin/users/{id}` - Cập nhật user
- **DELETE** `/api/user/admin/users/{id}` - Xóa user
- **PUT** `/api/user/admin/users/{id}/activate` - Kích hoạt/Vô hiệu hóa
- **PUT** `/api/user/admin/users/{id}/roles` - Phân quyền

### 3.2 Category Management
- **POST** `/api/categories` - Tạo category
- **PUT** `/api/categories/{id}` - Sửa category
- **DELETE** `/api/categories/{id}` - Xóa category
- **GET** `/api/categories/all` - Xem tất cả category

### 3.3 Product Management
- **GET** `/api/products/all/including-deleted` - Xem tất cả sản phẩm
- **GET** `/api/products/deleted` - Xem sản phẩm đã xóa
- **PUT** `/api/products/{id}/approve` - Duyệt sản phẩm
- **PUT** `/api/products/{id}/reject` - Từ chối sản phẩm
- **PUT** `/api/products/{id}/restore` - Khôi phục sản phẩm

### 3.4 Shop Management
- **GET** `/api/shop/all` - Xem tất cả shop
- **PUT** `/api/shop/{id}` - Cập nhật shop
- **DELETE** `/api/shop/{id}` - Xóa shop
- **PUT** `/api/shop/{id}/suspend` - Đình chỉ shop

### 3.5 Order Management
- **GET** `/api/orders` - Xem tất cả đơn hàng (có filter)
- **PUT** `/api/orders/{id}/status` - Cập nhật trạng thái đơn
- **DELETE** `/api/orders/{id}/cancel` - Hủy đơn hàng

### 3.6 Return Request Management
- **GET** `/api/orders/return-request/all` - Xem tất cả yêu cầu hoàn trả
- **PUT** `/api/orders/return-request/{id}/admin-decision` - Quyết định cuối cùng

### 3.7 Voucher Management
- **POST** `/api/vouchers` - Tạo voucher
- **PUT** `/api/vouchers/{id}` - Sửa voucher
- **PUT** `/api/vouchers/{id}/deactivate` - Vô hiệu hóa voucher
- **GET** `/api/vouchers/statistics` - Thống kê sử dụng voucher

### 3.8 Wallet Management
- **GET** `/api/wallets/all` - Xem tất cả ví shop
- **GET** `/api/wallets/withdrawal-requests` - Xem yêu cầu rút tiền
- **PUT** `/api/wallets/withdrawal-requests/{id}/process` - Duyệt/Từ chối rút tiền

### 3.9 Logistics Management
- **POST** `/api/managers` - Tạo Manager
- **POST** `/api/logistics/shipping-companies` - Tạo công ty vận chuyển
- **GET** `/api/logistics/shipment-orders/all` - Xem tất cả shipment
- **GET** `/api/dashboard` - Dashboard toàn hệ thống

### 3.10 Review Management
- **GET** `/api/reviews/all` - Xem tất cả đánh giá
- **DELETE** `/api/reviews/{id}` - Xóa đánh giá vi phạm
- **GET** `/api/reviews/reported` - Xem đánh giá bị report

### 3.11 System Configuration
- **GET** `/api/admin/settings` - Xem cấu hình hệ thống
- **PUT** `/api/admin/settings` - Cập nhật cấu hình
- **POST** `/api/admin/backup` - Backup database
- **POST** `/api/admin/restore` - Restore database

---

## 4. Luồng nghiệp vụ chính của Admin

### 4.1 Luồng giám sát hàng ngày
```
Đăng nhập → Xem dashboard tổng quan → Kiểm tra alerts 
→ Xử lý các vấn đề pending (rút tiền, hoàn trả, duyệt sản phẩm) 
→ Xem báo cáo doanh thu → Phân tích trends
```

### 4.2 Luồng xử lý tranh chấp
```
Nhận report/complaint → Xem chi tiết case → Thu thập bằng chứng từ 2 bên 
→ Phân tích và ra quyết định → Thực thi (hoàn tiền, phạt, etc) 
→ Thông báo kết quả → Đóng case
```

### 4.3 Luồng quản lý chất lượng
```
Định kỳ review sản phẩm mới → Kiểm tra shop rating thấp 
→ Xem đánh giá tiêu cực → Liên hệ shop cảnh cáo 
→ Đình chỉ shop vi phạm nghiêm trọng
```

### 4.4 Luồng tài chính
```
Duyệt yêu cầu rút tiền shop → Xác minh số dư và ngân hàng 
→ Approve và chuyển tiền → Cập nhật báo cáo tài chính 
→ Đối soát doanh thu platform
```

---

**Ghi chú:**
- Admin có quyền cao nhất trong hệ thống (Superuser)
- Tất cả thao tác quan trọng của Admin đều được log
- Admin có thể override mọi quyết định của User/Shop/Manager
- Dashboard real-time giúp Admin nắm bắt tình hình toàn hệ thống
- Cần authentication 2FA cho tài khoản Admin để bảo mật
- Admin chịu trách nhiệm về sự ổn định và phát triển của platform
