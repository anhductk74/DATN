# Sơ đồ Use Case và Đặc tả cho Actor EXPRESS MANAGER (Quản lý vận chuyển)

## 1. Sơ đồ Use Case

```
                                    ┌─────────────────────────────────┐
                                    │   Hệ thống Smart Mall           │
                                    │   (Logistics Module)            │
                                    └─────────────────────────────────┘
                                                    │
        ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
        │                                           │                                           │
    ┌───▼────┐                                      │                                           │
    │Đăng    │                                      │                                           │
    │nhập    │                                      │                                           │
    └────────┘                              ┌───────▼─────────┐                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Quản lý công  │        │
    │Quản lý   │◄───────────────────────────┤                 │         │ty vận chuyển │        │
    │shipper   │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │    EXPRESS      │         ┌──────────────┐        │
    ┌───▼────┐                              │    MANAGER      │◄────────┤Duyệt đăng ký │        │
    │Thêm    │                              │                 │         │shipper       │        │
    │shipper │                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Kích hoạt/Vô  │        │
    │Sửa thông                               │                 │         │hiệu hóa      │        │
    │tin     │                              │                 │         │shipper       │        │
    │shipper │                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Xóa shipper   │        │
    │Xem thống                               │                 │         └──────────────┘        │
    │kê shipper                              │                 │                                 │
    └────────┘                              │                 │         ┌──────────────┐        │
                                            │                 │◄────────┤Quản lý đơn   │        │
    ┌──────────┐                            │                 │         │vận chuyển    │        │
    │Quản lý   │◄───────────────────────────┤                 │         └──────────────┘        │
    │đơn vận   │                            │                 │                                 │
    │chuyển    │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Tạo đơn vận   │        │
        │                                   │                 │         │chuyển        │        │
    ┌───▼────┐                              │                 │         └──────────────┘        │
    │Phân công│                              │                 │                                 │
    │shipper  │                              │                 │         ┌──────────────┐        │
    └────────┘                              │                 │◄────────┤Phân công lại │        │
        │                                   │                 │         │shipper       │        │
    ┌───▼────┐                              │                 │         └──────────────┘        │
    │Theo dõi│                              │                 │                                 │
    │tiến độ │                              │                 │         ┌──────────────┐        │
    │giao hàng                               │                 │◄────────┤Xem dashboard │        │
    └────────┘                              │                 │         │vận chuyển    │        │
                                            │                 │         └──────────────┘        │
    ┌──────────┐                            │                 │                                 │
    │Xử lý vấn │◄───────────────────────────┤                 │         ┌──────────────┐        │
    │đề giao   │                            │                 │◄────────┤Quản lý kho   │        │
    │hàng      │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Xem báo cáo   │        │
    │Quản lý   │◄───────────────────────────┤                 │         │vận chuyển    │        │
    │tiền COD  │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Đối soát COD  │        │
    │Đối soát│                              │                 │         └──────────────┘        │
    │tiền với│                              │                 │                                 │
    │shipper │                              └─────────────────┘                                 │
    └────────┘                                                                                  │
                                                                                                │
    ┌──────────┐                                                                                │
    │Xem báo   │                                                                                │
    │cáo tài   │                                                                                │
    │chính     │                                                                                │
    └──────────┘                                                                                │
                                                                                                │
    ┌──────────┐                                                                                │
    │Quản lý   │                                                                                │
    │warehouse │                                                                                │
    └──────────┘                                                                                │
                                                                                                │
                                    ┌───────────────────────────────────────────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │  Admin System  │
                            │   (Oversight)  │
                            └────────────────┘
```

## 2. Đặc tả Use Case theo cấu trúc

### 2.1 Đăng nhập

| Tên usecase | Đăng nhập |
|-------------|-----------|
| **Mục đích** | Cho phép Express Manager đăng nhập vào hệ thống quản lý vận chuyển. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager đăng nhập để quản lý shipper, đơn vận chuyển và hoạt động logistics. |
| **Các quy tắc nghiệp vụ** | - Tài khoản phải được Admin cấp với role MANAGER.<br>- Phải được gắn với một Shipping Company.<br>- JWT token được cấp sau đăng nhập.<br>- Manager chỉ quản lý shipper và đơn hàng của công ty mình.<br>- Session timeout sau 8 giờ không hoạt động. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập hệ thống logistics.<br>2. Bước 1: Nhập username và password.<br>3. Bước 2: Hệ thống xác thực thông tin.<br>4. Bước 3: Kiểm tra role = MANAGER và có shipping company.<br>5. Bước 4: Trả về JWT token và thông tin manager.<br>6. Kết thúc: Chuyển đến dashboard quản lý. |

### 2.2 Quản lý công ty vận chuyển

| Tên usecase | Quản lý công ty vận chuyển |
|-------------|----------------------------|
| **Mục đích** | Cho phép Manager xem và cập nhật thông tin công ty vận chuyển. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem thông tin công ty, cập nhật thông tin liên hệ và cấu hình. |
| **Các quy tắc nghiệp vụ** | - Manager chỉ xem được công ty mình quản lý.<br>- Hiển thị: tên công ty, địa chỉ, số điện thoại, email.<br>- Cập nhật thông tin liên hệ.<br>- Không thay đổi tên công ty (phải Admin duyệt).<br>- Xem số lượng shipper đang hoạt động. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập trang công ty.<br>2. Bước 1: Hiển thị thông tin công ty hiện tại.<br>3. Bước 2: Manager chỉnh sửa thông tin cần thiết.<br>4. Bước 3: Hệ thống validate dữ liệu.<br>5. Bước 4: Cập nhật database.<br>6. Kết thúc: Thông báo cập nhật thành công. |

### 2.3 Quản lý shipper

| Tên usecase | Quản lý shipper |
|-------------|-----------------|
| **Mục đích** | Cho phép Manager quản lý danh sách shipper của công ty. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem, thêm, sửa, xóa và quản lý trạng thái shipper. |
| **Các quy tắc nghiệp vụ** | - Chỉ quản lý shipper của công ty mình.<br>- Xem danh sách với filter: status, region, search.<br>- Thống kê số shipper theo trạng thái.<br>- Hỗ trợ phân trang.<br>- Xem chi tiết thông tin và giấy tờ shipper.<br>- Có quyền approve/reject đăng ký shipper. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập trang quản lý shipper.<br>2. Bước 1: Hệ thống lấy danh sách shipper của công ty.<br>3. Bước 2: Hiển thị danh sách với filter.<br>4. Bước 3: Manager chọn thao tác với shipper.<br>5. Kết thúc: Danh sách được cập nhật. |

### 2.4 Duyệt đăng ký shipper

| Tên usecase | Duyệt đăng ký shipper |
|-------------|-----------------------|
| **Mục đích** | Cho phép Manager phê duyệt hoặc từ chối đơn đăng ký shipper mới. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem xét hồ sơ shipper và quyết định approve hoặc reject. |
| **Các quy tắc nghiệp vụ** | - Chỉ duyệt shipper đăng ký vào công ty mình.<br>- Xem thông tin: CMND, bằng lái, thông tin cá nhân.<br>- Kiểm tra tính hợp lệ của giấy tờ.<br>- Approve: chuyển status từ PENDING → ACTIVE.<br>- Reject: chuyển status → REJECTED và ghi lý do.<br>- Gửi thông báo cho người đăng ký. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager xem danh sách đơn đăng ký PENDING.<br>2. Bước 1: Chọn một đơn đăng ký để xem xét.<br>3. Bước 2: Xem chi tiết thông tin và ảnh giấy tờ.<br>4. Bước 3: Kiểm tra tính hợp lệ.<br>5. Bước 4: Chọn APPROVE hoặc REJECT.<br>6. Bước 5: Nếu REJECT, nhập lý do.<br>7. Bước 6: Cập nhật trạng thái shipper.<br>8. Bước 7: Gửi notification cho người đăng ký.<br>9. Kết thúc: Đơn đăng ký được xử lý. |

### 2.5 Thêm shipper

| Tên usecase | Thêm shipper |
|-------------|--------------|
| **Mục đích** | Cho phép Manager tạo mới tài khoản shipper cho công ty. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager trực tiếp thêm shipper mới vào hệ thống với đầy đủ thông tin. |
| **Các quy tắc nghiệp vụ** | - Phải cung cấp: fullName, phoneNumber, email, address, region.<br>- Upload CMND và bằng lái xe.<br>- Tự động gắn vào shipping company của manager.<br>- Tạo user account nếu chưa có.<br>- Trạng thái mặc định: ACTIVE.<br>- Upload ảnh lên Cloudinary. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn thêm shipper mới.<br>2. Bước 1: Điền form thông tin shipper.<br>3. Bước 2: Upload CMND và bằng lái.<br>4. Bước 3: Hệ thống validate thông tin.<br>5. Bước 4: Upload ảnh lên Cloudinary.<br>6. Bước 5: Tạo/liên kết user account.<br>7. Bước 6: Tạo shipper record với status ACTIVE.<br>8. Kết thúc: Shipper được thêm vào danh sách. |

### 2.6 Sửa thông tin shipper

| Tên usecase | Sửa thông tin shipper |
|-------------|-----------------------|
| **Mục đích** | Cho phép Manager cập nhật thông tin shipper của công ty. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager chỉnh sửa thông tin cá nhân, giấy tờ và khu vực hoạt động của shipper. |
| **Các quy tắc nghiệp vụ** | - Chỉ sửa được shipper của công ty mình.<br>- Có thể cập nhật: phoneNumber, address, region.<br>- Upload lại CMND/bằng lái nếu cần.<br>- Không thay đổi user account liên kết.<br>- Ghi log lịch sử thay đổi. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn shipper cần sửa.<br>2. Bước 1: Hiển thị thông tin hiện tại.<br>3. Bước 2: Manager chỉnh sửa các trường.<br>4. Bước 3: Upload ảnh mới nếu có.<br>5. Bước 4: Hệ thống validate và upload ảnh.<br>6. Bước 5: Cập nhật database.<br>7. Bước 6: Ghi log thay đổi.<br>8. Kết thúc: Thông báo cập nhật thành công. |

### 2.7 Kích hoạt/Vô hiệu hóa shipper

| Tên usecase | Kích hoạt/Vô hiệu hóa shipper |
|-------------|-------------------------------|
| **Mục đích** | Cho phép Manager thay đổi trạng thái hoạt động của shipper. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager kích hoạt (ACTIVE) hoặc vô hiệu hóa (INACTIVE) shipper. |
| **Các quy tắc nghiệp vụ** | - Chỉ thay đổi status shipper của công ty mình.<br>- ACTIVE: shipper có thể nhận đơn hàng.<br>- INACTIVE: shipper không nhận đơn mới, hoàn thành đơn hiện tại.<br>- Phải có lý do khi INACTIVE.<br>- Gửi thông báo cho shipper.<br>- Ghi log thay đổi trạng thái. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn shipper cần thay đổi trạng thái.<br>2. Bước 1: Xem trạng thái hiện tại.<br>3. Bước 2: Chọn trạng thái mới (ACTIVE/INACTIVE).<br>4. Bước 3: Nhập lý do thay đổi.<br>5. Bước 4: Hệ thống cập nhật status.<br>6. Bước 5: Gửi notification cho shipper.<br>7. Bước 6: Ghi log.<br>8. Kết thúc: Trạng thái được cập nhật. |

### 2.8 Xóa shipper

| Tên usecase | Xóa shipper |
|-------------|-------------|
| **Mục đích** | Cho phép Manager xóa shipper khỏi hệ thống. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager thực hiện soft delete shipper không còn làm việc. |
| **Các quy tắc nghiệp vụ** | - Chỉ xóa shipper của công ty mình.<br>- Soft delete: đánh dấu deletedAt.<br>- Không xóa được shipper đang có đơn hàng IN_TRANSIT.<br>- Phải hoàn thành tất cả đơn trước khi xóa.<br>- Lưu lại lịch sử làm việc.<br>- Admin có thể khôi phục. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn xóa shipper.<br>2. Bước 1: Kiểm tra shipper có đơn đang giao không.<br>3. Bước 2: Hiển thị cảnh báo xác nhận xóa.<br>4. Bước 3: Manager xác nhận.<br>5. Bước 4: Đánh dấu deletedAt = current timestamp.<br>6. Bước 5: Cập nhật status → DELETED.<br>7. Kết thúc: Shipper bị xóa khỏi danh sách active. |

### 2.9 Xem thống kê shipper

| Tên usecase | Xem thống kê shipper |
|-------------|-----------------------|
| **Mục đích** | Cho phép Manager xem thống kê về đội ngũ shipper. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem số lượng shipper, phân bố theo khu vực, hiệu suất làm việc. |
| **Các quy tắc nghiệp vụ** | - Thống kê shipper của công ty mình.<br>- Số lượng theo trạng thái: ACTIVE, INACTIVE, PENDING.<br>- Phân bố theo khu vực hoạt động.<br>- Top shipper hiệu suất cao nhất.<br>- Tỷ lệ giao hàng thành công trung bình.<br>- Biểu đồ xu hướng tuyển dụng. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập trang thống kê shipper.<br>2. Bước 1: Chọn khoảng thời gian.<br>3. Bước 2: Hệ thống tính toán các chỉ số.<br>4. Bước 3: Hiển thị dashboard với biểu đồ.<br>5. Bước 4: Hiển thị top performers.<br>6. Kết thúc: Manager phân tích dữ liệu. |

### 2.10 Quản lý đơn vận chuyển

| Tên usecase | Quản lý đơn vận chuyển |
|-------------|------------------------|
| **Mục đích** | Cho phép Manager quản lý tất cả đơn hàng vận chuyển của công ty. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem, tạo, cập nhật và theo dõi đơn vận chuyển. |
| **Các quy tắc nghiệp vụ** | - Quản lý đơn vận chuyển của công ty mình.<br>- Lọc theo: trạng thái, shipper, warehouse, ngày.<br>- Tìm kiếm theo mã đơn hoặc địa chỉ.<br>- Hỗ trợ phân trang.<br>- Xem chi tiết từng đơn.<br>- Export danh sách đơn hàng. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập quản lý đơn vận chuyển.<br>2. Bước 1: Hệ thống lấy shipment orders của công ty.<br>3. Bước 2: Manager chọn bộ lọc.<br>4. Bước 3: Hiển thị danh sách với phân trang.<br>5. Bước 4: Manager chọn đơn để xem chi tiết hoặc phân công.<br>6. Kết thúc: Thực hiện các thao tác quản lý. |

### 2.11 Tạo đơn vận chuyển

| Tên usecase | Tạo đơn vận chuyển |
|-------------|--------------------|
| **Mục đích** | Cho phép Manager tạo shipment order mới cho order từ shop. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager tạo đơn vận chuyển từ order đã được shop xác nhận. |
| **Các quy tắc nghiệp vụ** | - Tạo từ order có status CONFIRMED.<br>- Chọn warehouse xuất hàng.<br>- Tính phí vận chuyển dựa trên khoảng cách.<br>- Trạng thái ban đầu: PENDING.<br>- Tạo shipment tracking log.<br>- Có thể assign shipper ngay hoặc sau. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn order cần tạo shipment.<br>2. Bước 1: Kiểm tra order status = CONFIRMED.<br>3. Bước 2: Chọn warehouse xuất hàng.<br>4. Bước 3: Hệ thống tính phí ship.<br>5. Bước 4: Nhập thông tin bổ sung (nếu có).<br>6. Bước 5: Tạo shipment order với status PENDING.<br>7. Bước 6: Tạo tracking log khởi tạo.<br>8. Kết thúc: Shipment sẵn sàng để assign shipper. |

### 2.12 Phân công shipper

| Tên usecase | Phân công shipper |
|-------------|-------------------|
| **Mục đích** | Cho phép Manager giao đơn hàng cho shipper cụ thể. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager assign shipment order cho shipper phù hợp. |
| **Các quy tắc nghiệp vụ** | - Chỉ assign cho shipper ACTIVE của công ty mình.<br>- Shipper phải ở khu vực phù hợp với địa chỉ giao.<br>- Kiểm tra workload hiện tại của shipper.<br>- Cập nhật status shipment → ASSIGNED.<br>- Gửi notification cho shipper.<br>- Tạo tracking log. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn shipment cần assign.<br>2. Bước 1: Xem danh sách shipper available.<br>3. Bước 2: Lọc theo khu vực và workload.<br>4. Bước 3: Chọn shipper phù hợp.<br>5. Bước 4: Hệ thống cập nhật shipperId cho shipment.<br>6. Bước 5: Cập nhật status → ASSIGNED.<br>7. Bước 6: Gửi push notification cho shipper.<br>8. Bước 7: Tạo tracking log.<br>9. Kết thúc: Đơn hàng được giao cho shipper. |

### 2.13 Phân công lại shipper

| Tên usecase | Phân công lại shipper |
|-------------|-----------------------|
| **Mục đích** | Cho phép Manager thay đổi shipper được giao đơn hàng. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager reassign shipment cho shipper khác khi có vấn đề. |
| **Các quy tắc nghiệp vụ** | - Chỉ reassign đơn chưa DELIVERED.<br>- Phải có lý do reassign.<br>- Thông báo cho shipper cũ.<br>- Assign cho shipper mới.<br>- Ghi log thay đổi.<br>- Cập nhật tracking log. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager chọn đơn cần reassign.<br>2. Bước 1: Nhập lý do reassign.<br>3. Bước 2: Chọn shipper mới.<br>4. Bước 3: Hệ thống gửi notification cho shipper cũ (hủy).<br>5. Bước 4: Cập nhật shipperId mới.<br>6. Bước 5: Gửi notification cho shipper mới.<br>7. Bước 6: Ghi log thay đổi.<br>8. Kết thúc: Đơn hàng được assign lại. |

### 2.14 Theo dõi tiến độ giao hàng

| Tên usecase | Theo dõi tiến độ giao hàng |
|-------------|----------------------------|
| **Mục đích** | Cho phép Manager theo dõi real-time tiến độ các đơn hàng. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem trạng thái và vị trí của tất cả đơn hàng đang giao. |
| **Các quy tắc nghiệp vụ** | - Hiển thị tất cả shipment của công ty theo thời gian thực.<br>- Xem vị trí GPS của shipper trên bản đồ.<br>- Lọc theo trạng thái và shipper.<br>- Hiển thị ETA (estimated time of arrival).<br>- Cảnh báo đơn hàng chậm.<br>- Refresh tự động mỗi 30s. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập trang tracking.<br>2. Bước 1: Hiển thị bản đồ với vị trí các shipper.<br>3. Bước 2: Hiển thị danh sách đơn đang giao.<br>4. Bước 3: Manager chọn đơn để xem chi tiết.<br>5. Bước 4: Hiển thị lịch sử tracking.<br>6. Bước 5: Hiển thị ETA và khoảng cách còn lại.<br>7. Kết thúc: Manager giám sát tiến độ. |

### 2.15 Xử lý vấn đề giao hàng

| Tên usecase | Xử lý vấn đề giao hàng |
|-------------|------------------------|
| **Mục đích** | Cho phép Manager xử lý các issue do shipper báo cáo. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem các vấn đề phát sinh và đưa ra giải pháp. |
| **Các quy tắc nghiệp vụ** | - Nhận notification khi shipper báo cáo issue.<br>- Xem chi tiết vấn đề và hình ảnh minh chứng.<br>- Các loại vấn đề: CUSTOMER_UNAVAILABLE, WRONG_ADDRESS, DAMAGED_GOODS, REFUSED.<br>- Quyết định: giao lại, hoàn hàng, liên hệ khách.<br>- Reassign shipper nếu cần.<br>- Cập nhật trạng thái issue. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager nhận notification có issue mới.<br>2. Bước 1: Xem chi tiết issue và hình ảnh.<br>3. Bước 2: Liên hệ shipper để hiểu rõ tình huống.<br>4. Bước 3: Liên hệ khách hàng nếu cần.<br>5. Bước 4: Quyết định giải pháp: reschedule, return, reassign.<br>6. Bước 5: Thực hiện thao tác tương ứng.<br>7. Bước 6: Cập nhật trạng thái issue → RESOLVED.<br>8. Kết thúc: Vấn đề được xử lý. |

### 2.16 Xem dashboard vận chuyển

| Tên usecase | Xem dashboard vận chuyển |
|-------------|-----------------------------|
| **Mục đích** | Cho phép Manager xem tổng quan hoạt động vận chuyển của công ty. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem dashboard với các KPI quan trọng về vận chuyển. |
| **Các quy tắc nghiệp vụ** | - Hiển thị số liệu của công ty mình theo thời gian.<br>- KPI: tổng đơn, đơn thành công, đơn thất bại, đúng hạn %.<br>- Biểu đồ xu hướng theo ngày/tuần/tháng.<br>- So sánh với kỳ trước.<br>- Top shipper hiệu suất cao.<br>- Phân bố đơn hàng theo khu vực. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập dashboard.<br>2. Bước 1: Chọn khoảng thời gian.<br>3. Bước 2: Hệ thống tính toán các KPI.<br>4. Bước 3: Hiển thị dashboard với biểu đồ.<br>5. Bước 4: Hiển thị insights và trends.<br>6. Kết thúc: Manager phân tích hiệu suất. |

### 2.17 Quản lý kho

| Tên usecase | Quản lý kho |
|-------------|-------------|
| **Mục đích** | Cho phép Manager quản lý warehouse của công ty vận chuyển. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager quản lý các kho hàng, tồn kho và nhập/xuất hàng. |
| **Các quy tắc nghiệp vụ** | - Quản lý warehouse của công ty mình.<br>- Thêm/sửa/xóa warehouse.<br>- Quản lý inventory trong từng kho.<br>- Theo dõi hàng nhập/xuất.<br>- Tạo phiếu nhập/xuất kho.<br>- Kiểm kê định kỳ. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập quản lý kho.<br>2. Bước 1: Xem danh sách warehouse.<br>3. Bước 2: Chọn warehouse để quản lý.<br>4. Bước 3: Xem tồn kho và lịch sử nhập/xuất.<br>5. Bước 4: Thực hiện các thao tác quản lý.<br>6. Kết thúc: Kho được cập nhật. |

### 2.18 Quản lý tiền COD

| Tên usecase | Quản lý tiền COD |
|-------------|------------------|
| **Mục đích** | Cho phép Manager quản lý tiền thu hộ (COD) từ các shipper. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager theo dõi số tiền COD shipper thu được và đối soát định kỳ. |
| **Các quy tắc nghiệp vụ** | - Theo dõi tổng tiền COD của từng shipper.<br>- Xem chi tiết từng giao dịch COD.<br>- Lập lịch đối soát định kỳ (hàng ngày/tuần).<br>- Ghi nhận shipper nộp tiền.<br>- Tạo báo cáo tài chính COD.<br>- Cảnh báo shipper chưa nộp tiền đúng hạn. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập quản lý COD.<br>2. Bước 1: Xem tổng quan tiền COD theo shipper.<br>3. Bước 2: Chọn shipper để xem chi tiết.<br>4. Bước 3: Xem danh sách đơn COD đã thu.<br>5. Bước 4: Đối soát và ghi nhận nộp tiền.<br>6. Kết thúc: Cập nhật balance shipper. |

### 2.19 Đối soát COD

| Tên usecase | Đối soát COD |
|-------------|--------------|
| **Mục đích** | Cho phép Manager thực hiện đối soát tiền COD với shipper. |
| **Tác nhân** | Express Manager, Shipper |
| **Mô tả** | Manager và shipper đối chiếu số tiền COD đã thu và nộp. |
| **Các quy tắc nghiệp vụ** | - Đối soát theo ca/ngày/tuần.<br>- So sánh số tiền thực tế với hệ thống.<br>- Ghi nhận chênh lệch (nếu có).<br>- Shipper ký xác nhận đối soát.<br>- Cập nhật balance sau đối soát.<br>- Tạo báo cáo đối soát. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager tạo phiên đối soát COD.<br>2. Bước 1: Chọn shipper và khoảng thời gian.<br>3. Bước 2: Hệ thống tính tổng COD phải nộp.<br>4. Bước 3: Shipper nộp tiền thực tế.<br>5. Bước 4: So sánh số liệu hệ thống và thực tế.<br>6. Bước 5: Ghi nhận chênh lệch (nếu có).<br>7. Bước 6: Shipper ký xác nhận.<br>8. Bước 7: Cập nhật balance shipper = 0.<br>9. Kết thúc: Tạo biên bản đối soát. |

### 2.20 Xem báo cáo vận chuyển

| Tên usecase | Xem báo cáo vận chuyển |
|-------------|-----------------------|
| **Mục đích** | Cho phép Manager xem các báo cáo chi tiết về hoạt động vận chuyển. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem và export các báo cáo thống kê vận chuyển. |
| **Các quy tắc nghiệp vụ** | - Báo cáo theo khoảng thời gian tùy chỉnh.<br>- Các loại báo cáo: hiệu suất giao hàng, shipper performance, COD, warehouse.<br>- Export PDF/Excel.<br>- Biểu đồ trực quan.<br>- So sánh với kỳ trước. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập trang báo cáo.<br>2. Bước 1: Chọn loại báo cáo cần xem.<br>3. Bước 2: Chọn khoảng thời gian.<br>4. Bước 3: Hệ thống tổng hợp dữ liệu.<br>5. Bước 4: Hiển thị báo cáo với biểu đồ.<br>6. Bước 5: Manager xem và phân tích.<br>7. Kết thúc: Export báo cáo nếu cần. |

### 2.21 Xem báo cáo tài chính

| Tên usecase | Xem báo cáo tài chính |
|-------------|-----------------------|
| **Mục đích** | Cho phép Manager xem báo cáo tài chính về doanh thu vận chuyển. |
| **Tác nhân** | Express Manager |
| **Mô tả** | Manager xem doanh thu từ phí vận chuyển, chi phí và lợi nhuận. |
| **Các quy tắc nghiệp vụ** | - Tính doanh thu từ shipping fee.<br>- Chi phí: lương shipper, vận hành kho.<br>- Lợi nhuận = doanh thu - chi phí.<br>- Thống kê theo thời gian.<br>- Phân tích ROI.<br>- Export báo cáo Excel. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager truy cập báo cáo tài chính.<br>2. Bước 1: Chọn khoảng thời gian.<br>3. Bước 2: Hệ thống tính toán doanh thu và chi phí.<br>4. Bước 3: Hiển thị báo cáo với biểu đồ.<br>5. Bước 4: Phân tích lợi nhuận.<br>6. Kết thúc: Export báo cáo. |

---

## 3. API Endpoints cho Express Manager

### 3.1 Manager Profile
- **GET** `/api/managers/{id}` - Xem thông tin manager
- **GET** `/api/managers/user/{userId}` - Lấy manager theo userId
- **DELETE** `/api/managers/{id}` - Xóa manager

### 3.2 Shipper Management (by Manager)
- **POST** `/api/managers/shippers/register` - Đăng ký shipper mới cho công ty
- **GET** `/api/managers/shippers` - Xem danh sách shipper công ty (có filter)
- **GET** `/api/managers/shippers/{id}` - Xem chi tiết shipper
- **PUT** `/api/managers/shippers/{id}` - Cập nhật thông tin shipper
- **DELETE** `/api/managers/shippers/{id}` - Xóa shipper
- **PUT** `/api/managers/shippers/{id}/status` - Kích hoạt/vô hiệu hóa shipper
- **PUT** `/api/managers/shippers/{id}/approve` - Duyệt đăng ký shipper
- **PUT** `/api/managers/shippers/{id}/reject` - Từ chối đăng ký shipper

### 3.3 Shipment Order Management
- **GET** `/api/logistics/shipment-orders/company/{shippingCompanyId}` - Xem đơn vận chuyển công ty
- **POST** `/api/logistics/shipment-orders` - Tạo đơn vận chuyển mới
- **PUT** `/api/logistics/shipment-orders/{id}/assign-shipper` - Phân công shipper
- **PUT** `/api/logistics/shipment-orders/{id}/unassign-shipper` - Hủy phân công shipper
- **PUT** `/api/logistics/shipment-orders/{id}/status` - Cập nhật trạng thái
- **DELETE** `/api/logistics/shipment-orders/{id}` - Xóa đơn vận chuyển

### 3.4 Dashboard & Reports
- **GET** `/api/dashboard` - Xem dashboard vận chuyển (theo company)
- **GET** `/api/logistics/shipment-orders/dashboard` - Dashboard thống kê shipment
- **GET** `/api/logistics/finance-report` - Báo cáo tài chính

### 3.5 COD Management
- **GET** `/api/logistics/cod-reconciliation/company/{companyId}` - Danh sách đối soát COD
- **POST** `/api/logistics/cod-reconciliation` - Tạo phiên đối soát COD
- **PUT** `/api/logistics/cod-reconciliation/{id}/complete` - Hoàn thành đối soát

### 3.6 Warehouse Management
- **GET** `/api/logistics/warehouses/company/{companyId}` - Danh sách kho công ty
- **POST** `/api/logistics/warehouses` - Tạo kho mới
- **PUT** `/api/logistics/warehouses/{id}` - Cập nhật thông tin kho
- **DELETE** `/api/logistics/warehouses/{id}` - Xóa kho

---

## 4. Luồng nghiệp vụ chính của Express Manager

### 4.1 Luồng quản lý shipper
```
Nhận đơn đăng ký shipper → Xem xét hồ sơ → Approve/Reject 
→ Nếu Approve: Kích hoạt shipper → Shipper bắt đầu làm việc
→ Theo dõi hiệu suất → Khen thưởng/Kỷ luật
```

### 4.2 Luồng xử lý đơn vận chuyển
```
Nhận order từ shop → Tạo shipment order → Chọn warehouse 
→ Chọn shipper phù hợp → Assign đơn → Theo dõi tiến độ 
→ Xử lý issue (nếu có) → Hoàn thành giao hàng
```

### 4.3 Luồng đối soát COD
```
Cuối ca/ngày → Tạo phiên đối soát → Shipper mang tiền đến 
→ So sánh số liệu → Ghi nhận chênh lệch → Shipper ký xác nhận 
→ Cập nhật balance → Tạo biên bản
```

### 4.4 Luồng báo cáo
```
Chọn kỳ báo cáo → Hệ thống tổng hợp dữ liệu → Phân tích KPI 
→ Tạo insight → Export báo cáo → Trình Admin/Giám đốc
```

---

**Ghi chú:**
- Express Manager phải được Admin tạo và gắn với Shipping Company
- Manager chỉ quản lý shipper và shipment của công ty mình
- Có quyền cao hơn shipper nhưng thấp hơn Admin
- Chịu trách nhiệm về hiệu suất vận chuyển của công ty
- Dashboard real-time giúp theo dõi và ra quyết định nhanh
