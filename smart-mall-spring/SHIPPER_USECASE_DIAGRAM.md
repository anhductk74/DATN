# Sơ đồ Use Case và Đặc tả cho Actor SHIPPER (Nhân viên giao hàng)

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
    │Đăng ký │                                      │                                           │
    │shipper │                                      │                                           │
    └────────┘                                      │                                           │
        │                                           │                                           │
    ┌───▼────┐                                      │                                           │
    │Đăng    │                              ┌───────▼─────────┐                                 │
    │nhập    │                              │                 │         ┌──────────────┐        │
    └────────┘                              │                 │◄────────┤Xem đơn hàng  │        │
                                            │                 │         │được giao     │        │
    ┌──────────┐                            │                 │         └──────────────┘        │
    │Cập nhật  │◄───────────────────────────┤                 │                                 │
    │thông tin │                            │                 │         ┌──────────────┐        │
    │cá nhân   │                            │                 │◄────────┤Nhận đơn giao │        │
    └──────────┘                            │     SHIPPER     │         │hàng          │        │
                                            │                 │         └──────────────┘        │
    ┌──────────┐                            │                 │                                 │
    │Xem danh  │◄───────────────────────────┤                 │         ┌──────────────┐        │
    │sách đơn  │                            │                 │◄────────┤Cập nhật trạng│        │
    │hàng      │                            │                 │         │thái giao hàng│        │
    └──────────┘                            │                 │         └──────────────┘        │
        │                                   │                 │                                 │
    ┌───▼────┐                              │                 │         ┌──────────────┐        │
    │Lọc đơn │                              │                 │◄────────┤Xác nhận giao │        │
    │theo    │                              │                 │         │hàng thành    │        │
    │trạng   │                              │                 │         │công          │        │
    │thái    │                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Báo cáo vấn đề│        │
    │Xem chi   │◄───────────────────────────┤                 │         │giao hàng     │        │
    │tiết đơn  │                            │                 │         └──────────────┘        │
    │hàng      │                            │                 │                                 │
    └──────────┘                            │                 │         ┌──────────────┐        │
                                            │                 │◄────────┤Quét mã QR    │        │
    ┌──────────┐                            │                 │         │đơn hàng      │        │
    │Cập nhật  │◄───────────────────────────┤                 │         └──────────────┘        │
    │vị trí    │                            │                 │                                 │
    │hiện tại  │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Xem lịch sử   │        │
                                            │                 │         │giao hàng     │        │
    ┌──────────┐                            │                 │         └──────────────┘        │
    │Xem thu   │◄───────────────────────────┤                 │                                 │
    │nhập      │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Xem thống kê  │        │
        │                                   │                 │         │hiệu suất     │        │
    ┌───▼────┐                              │                 │         └──────────────┘        │
    │Xem chi  │                              │                 │                                 │
    │tiết giao                               │                 │                                 │
    │dịch     │                              └─────────────────┘                                 │
    └────────┘                                                                                   │
                                                                                                 │
    ┌──────────┐                                                                                 │
    │Yêu cầu   │                                                                                 │
    │hỗ trợ    │                                                                                 │
    └──────────┘                                                                                 │
                                                                                                 │
                                    ┌────────────────────────────────────────────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │ Express Manager│
                            │    (Assign)    │
                            └────────────────┘
```

## 2. Đặc tả Use Case theo cấu trúc

### 2.1 Đăng ký shipper

| Tên usecase | Đăng ký shipper |
|-------------|-----------------|
| **Mục đích** | Cho phép người dùng đăng ký trở thành nhân viên giao hàng (shipper). |
| **Tác nhân** | Người dùng (User), Express Manager |
| **Mô tả** | Người dùng cung cấp thông tin cá nhân, giấy tờ và đăng ký vào đơn vị vận chuyển để trở thành shipper. |
| **Các quy tắc nghiệp vụ** | - Phải có tài khoản user hợp lệ trong hệ thống.<br>- Upload CMND/CCCD (mặt trước, mặt sau).<br>- Upload bằng lái xe (nếu có).<br>- Cung cấp: họ tên, số điện thoại, địa chỉ, khu vực hoạt động.<br>- Tài liệu được upload lên Cloudinary.<br>- Trạng thái ban đầu: PENDING (chờ duyệt).<br>- Express Manager hoặc Admin phê duyệt. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang đăng ký shipper.<br>2. Bước 1: Hệ thống hiển thị form đăng ký.<br>3. Bước 2: Người dùng điền thông tin: fullName, phoneNumber, address, region.<br>4. Bước 3: Upload CMND mặt trước, mặt sau.<br>5. Bước 4: Upload bằng lái xe (optional).<br>6. Bước 5: Chọn đơn vị vận chuyển (shipping company).<br>7. Bước 6: Hệ thống upload ảnh lên Cloudinary.<br>8. Bước 7: Tạo shipper record với trạng thái PENDING.<br>9. Kết thúc: Chờ Manager/Admin phê duyệt. |

### 2.2 Đăng nhập

| Tên usecase | Đăng nhập |
|-------------|-----------|
| **Mục đích** | Cho phép shipper đăng nhập vào hệ thống để làm việc. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper đăng nhập bằng tài khoản đã được phê duyệt để nhận và giao đơn hàng. |
| **Các quy tắc nghiệp vụ** | - Tài khoản shipper phải có trạng thái ACTIVE.<br>- Sử dụng username/email và password.<br>- Hỗ trợ đăng nhập mobile qua mã xác thực.<br>- JWT token được cấp sau khi đăng nhập.<br>- Shipper chỉ truy cập được các chức năng giao hàng. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper mở app giao hàng.<br>2. Bước 1: Nhập username và password.<br>3. Bước 2: Hệ thống xác thực thông tin.<br>4. Bước 3: Kiểm tra shipper status = ACTIVE.<br>5. Bước 4: Trả về JWT token và thông tin shipper.<br>6. Kết thúc: Chuyển đến trang danh sách đơn hàng. |

### 2.3 Cập nhật thông tin cá nhân

| Tên usecase | Cập nhật thông tin cá nhân |
|-------------|----------------------------|
| **Mục đích** | Cho phép shipper cập nhật thông tin cá nhân và giấy tờ. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper có thể chỉnh sửa thông tin: số điện thoại, địa chỉ, khu vực hoạt động và cập nhật giấy tờ. |
| **Các quy tắc nghiệp vụ** | - Shipper chỉ sửa được thông tin của mình.<br>- Có thể cập nhật: phoneNumber, address, region.<br>- Upload lại CMND/bằng lái nếu hết hạn.<br>- Manager phê duyệt nếu thay đổi giấy tờ quan trọng.<br>- Không thể thay đổi shipping company tự ý. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper truy cập trang cập nhật thông tin.<br>2. Bước 1: Hiển thị thông tin hiện tại.<br>3. Bước 2: Shipper chỉnh sửa các trường cần thiết.<br>4. Bước 3: Upload ảnh mới nếu cần.<br>5. Bước 4: Hệ thống validate và upload ảnh lên Cloudinary.<br>6. Bước 5: Cập nhật database.<br>7. Kết thúc: Thông báo cập nhật thành công. |

### 2.4 Xem danh sách đơn hàng

| Tên usecase | Xem danh sách đơn hàng |
|-------------|------------------------|
| **Mục đích** | Cho phép shipper xem các đơn hàng được giao cho mình. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xem tất cả đơn hàng đã được phân công và có thể lọc theo trạng thái. |
| **Các quy tắc nghiệp vụ** | - Chỉ hiển thị đơn hàng được giao cho shipper này.<br>- Lọc theo trạng thái: ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED.<br>- Sắp xếp theo thời gian tạo hoặc deadline.<br>- Hiển thị địa chỉ giao hàng và khoảng cách.<br>- Hỗ trợ phân trang.<br>- Tìm kiếm theo mã đơn hàng. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper mở app và truy cập danh sách đơn.<br>2. Bước 1: Hệ thống lấy shipment orders của shipper.<br>3. Bước 2: Shipper chọn bộ lọc (trạng thái, ngày).<br>4. Bước 3: Hiển thị danh sách với phân trang.<br>5. Bước 4: Hiển thị thông tin cơ bản: mã đơn, địa chỉ, trạng thái.<br>6. Kết thúc: Shipper chọn đơn để xem chi tiết. |

### 2.5 Nhận đơn giao hàng

| Tên usecase | Nhận đơn giao hàng |
|-------------|---------------------|
| **Mục đích** | Cho phép shipper nhận đơn hàng mới được phân công. |
| **Tác nhân** | Shipper, Express Manager |
| **Mô tả** | Manager phân công đơn hàng cho shipper, shipper xác nhận nhận đơn. |
| **Các quy tắc nghiệp vụ** | - Manager assign đơn hàng cho shipper cụ thể.<br>- Shipper nhận thông báo có đơn hàng mới.<br>- Shipper xác nhận nhận đơn trong thời gian quy định.<br>- Trạng thái chuyển từ PENDING → ASSIGNED.<br>- Nếu không xác nhận, Manager có thể assign cho shipper khác.<br>- Cập nhật shipment log. |
| **Luồng Cơ bản** | 1. Mở đầu: Manager assign đơn cho shipper.<br>2. Bước 1: Shipper nhận push notification.<br>3. Bước 2: Shipper mở app xem thông tin đơn hàng.<br>4. Bước 3: Xem địa chỉ, hàng hóa, yêu cầu đặc biệt.<br>5. Bước 4: Shipper xác nhận nhận đơn.<br>6. Bước 5: Cập nhật trạng thái ASSIGNED.<br>7. Bước 6: Tạo shipment log.<br>8. Kết thúc: Đơn hàng xuất hiện trong danh sách của shipper. |

### 2.6 Xem chi tiết đơn hàng

| Tên usecase | Xem chi tiết đơn hàng |
|-------------|-----------------------|
| **Mục đích** | Cho phép shipper xem thông tin chi tiết của đơn hàng cần giao. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xem đầy đủ thông tin: người nhận, địa chỉ, sản phẩm, ghi chú đặc biệt. |
| **Các quy tắc nghiệp vụ** | - Hiển thị thông tin người nhận: tên, SĐT, địa chỉ chi tiết.<br>- Hiển thị danh sách sản phẩm trong đơn.<br>- Hiển thị ghi chú từ khách hàng.<br>- Hiển thị phương thức thanh toán (COD hay đã thanh toán).<br>- Hiển thị số tiền cần thu (nếu COD).<br>- Hiển thị lịch sử tracking. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper chọn đơn hàng từ danh sách.<br>2. Bước 1: Hệ thống lấy thông tin chi tiết shipment order.<br>3. Bước 2: Hiển thị thông tin người nhận.<br>4. Bước 3: Hiển thị địa chỉ giao hàng trên bản đồ.<br>5. Bước 4: Hiển thị danh sách sản phẩm.<br>6. Bước 5: Hiển thị số tiền cần thu (nếu COD).<br>7. Kết thúc: Shipper có thể gọi điện hoặc dẫn đường. |

### 2.7 Cập nhật trạng thái giao hàng

| Tên usecase | Cập nhật trạng thái giao hàng |
|-------------|-------------------------------|
| **Mục đích** | Cho phép shipper cập nhật trạng thái đơn hàng trong quá trình giao. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper thay đổi trạng thái đơn hàng: đã lấy hàng, đang giao, đã giao thành công. |
| **Các quy tắc nghiệp vụ** | - Các trạng thái: ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED.<br>- Mỗi lần cập nhật phải có ghi chú.<br>- Tạo tracking log với timestamp.<br>- Gửi thông báo cho khách hàng.<br>- PICKED_UP: shipper đã lấy hàng từ shop/warehouse.<br>- IN_TRANSIT: đang trên đường giao.<br>- DELIVERED: đã giao thành công. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper chọn cập nhật trạng thái.<br>2. Bước 1: Hệ thống hiển thị trạng thái hiện tại.<br>3. Bước 2: Shipper chọn trạng thái mới.<br>4. Bước 3: Nhập ghi chú (bắt buộc).<br>5. Bước 4: Hệ thống validate luồng trạng thái hợp lệ.<br>6. Bước 5: Cập nhật trạng thái shipment order.<br>7. Bước 6: Tạo shipment log với timestamp.<br>8. Bước 7: Gửi notification cho khách hàng.<br>9. Kết thúc: Trạng thái được cập nhật. |

### 2.8 Xác nhận giao hàng thành công

| Tên usecase | Xác nhận giao hàng thành công |
|-------------|-------------------------------|
| **Mục đích** | Cho phép shipper xác nhận đã giao hàng thành công cho khách. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xác nhận khách hàng đã nhận hàng và thu tiền (nếu COD). |
| **Các quy tắc nghiệp vụ** | - Shipper phải ở trạng thái IN_TRANSIT.<br>- Nếu COD, phải nhập số tiền đã thu.<br>- Có thể chụp ảnh xác nhận giao hàng.<br>- Cập nhật trạng thái DELIVERED.<br>- Cập nhật order status → DELIVERED.<br>- Nếu COD, ghi nhận số tiền vào ví shipper.<br>- Tăng số đơn giao thành công của shipper.<br>- Cập nhật wallet shop (tiền vào ví shop). |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper đến địa chỉ giao hàng.<br>2. Bước 1: Shipper chọn "Giao hàng thành công".<br>3. Bước 2: Nếu COD, nhập số tiền đã thu.<br>4. Bước 3: Chụp ảnh xác nhận (optional).<br>5. Bước 4: Hệ thống upload ảnh lên Cloudinary.<br>6. Bước 5: Cập nhật shipment status → DELIVERED.<br>7. Bước 6: Cập nhật order status → DELIVERED.<br>8. Bước 7: Ghi nhận số tiền COD vào shipper balance.<br>9. Bước 8: Cập nhật wallet shop.<br>10. Bước 9: Gửi notification cho khách và shop.<br>11. Kết thúc: Hoàn thành đơn hàng. |

### 2.9 Báo cáo vấn đề giao hàng

| Tên usecase | Báo cáo vấn đề giao hàng |
|-------------|--------------------------|
| **Mục đích** | Cho phép shipper báo cáo các vấn đề phát sinh trong quá trình giao hàng. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper báo cáo các vấn đề: khách không nhận, sai địa chỉ, hàng bị hư hỏng, v.v. |
| **Các quy tắc nghiệp vụ** | - Shipper chọn loại vấn đề: CUSTOMER_UNAVAILABLE, WRONG_ADDRESS, DAMAGED_GOODS, REFUSED.<br>- Phải nhập mô tả chi tiết.<br>- Upload ảnh minh chứng.<br>- Trạng thái shipment → FAILED hoặc RETURNED.<br>- Manager/Admin được thông báo ngay lập tức.<br>- Cập nhật shipment log.<br>- Có thể lên lịch giao lại. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper gặp vấn đề khi giao hàng.<br>2. Bước 1: Shipper chọn "Báo cáo vấn đề".<br>3. Bước 2: Chọn loại vấn đề từ danh sách.<br>4. Bước 3: Nhập mô tả chi tiết vấn đề.<br>5. Bước 4: Chụp ảnh minh chứng.<br>6. Bước 5: Hệ thống upload ảnh lên Cloudinary.<br>7. Bước 6: Tạo issue report.<br>8. Bước 7: Cập nhật trạng thái shipment (FAILED/RETURNED).<br>9. Bước 8: Gửi notification cho Manager.<br>10. Kết thúc: Chờ Manager xử lý. |

### 2.10 Quét mã QR đơn hàng

| Tên usecase | Quét mã QR đơn hàng |
|-------------|---------------------|
| **Mục đích** | Cho phép shipper quét mã QR để xác nhận lấy hàng hoặc giao hàng nhanh chóng. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper sử dụng camera quét mã QR trên đơn hàng để cập nhật trạng thái tự động. |
| **Các quy tắc nghiệp vụ** | - Mỗi đơn hàng có mã QR unique.<br>- Quét QR khi lấy hàng từ shop/warehouse.<br>- Quét QR khi giao cho khách hàng.<br>- Tự động cập nhật trạng thái sau khi quét.<br>- Validate QR code hợp lệ.<br>- Ghi log thời gian quét QR. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper chọn chức năng quét QR.<br>2. Bước 1: Mở camera quét mã.<br>3. Bước 2: Shipper quét mã QR trên đơn hàng.<br>4. Bước 3: Hệ thống decode QR và lấy shipment ID.<br>5. Bước 4: Validate shipment thuộc shipper này.<br>6. Bước 5: Tự động cập nhật trạng thái phù hợp.<br>7. Bước 6: Tạo tracking log.<br>8. Kết thúc: Hiển thị thông báo thành công. |

### 2.11 Cập nhật vị trí hiện tại

| Tên usecase | Cập nhật vị trí hiện tại |
|-------------|--------------------------|
| **Mục đích** | Cho phép shipper cập nhật vị trí GPS để tracking real-time. |
| **Tác nhân** | Shipper |
| **Mô tả** | App tự động gửi vị trí GPS của shipper để khách hàng có thể theo dõi. |
| **Các quy tắc nghiệp vụ** | - Tự động cập nhật vị trí mỗi 30 giây khi có đơn đang giao.<br>- Lưu lịch sử vị trí để phân tích sau.<br>- Khách hàng có thể xem vị trí shipper real-time.<br>- Tính khoảng cách đến địa chỉ giao hàng.<br>- Chỉ tracking khi shipper đang ON_DUTY.<br>- Bảo mật thông tin vị trí. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper bật chế độ ON_DUTY.<br>2. Bước 1: App request quyền truy cập GPS.<br>3. Bước 2: Lấy tọa độ GPS hiện tại.<br>4. Bước 3: Gửi tọa độ lên server mỗi 30s.<br>5. Bước 4: Hệ thống lưu vào location history.<br>6. Bước 5: Cập nhật vị trí real-time cho khách hàng.<br>7. Kết thúc: Dừng tracking khi OFF_DUTY. |

### 2.12 Xem lịch sử giao hàng

| Tên usecase | Xem lịch sử giao hàng |
|-------------|-----------------------|
| **Mục đích** | Cho phép shipper xem lịch sử các đơn hàng đã giao. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xem danh sách tất cả đơn hàng đã giao thành công hoặc thất bại. |
| **Các quy tắc nghiệp vụ** | - Hiển thị đơn hàng với trạng thái DELIVERED hoặc FAILED.<br>- Lọc theo khoảng thời gian.<br>- Hiển thị: mã đơn, ngày giao, địa chỉ, số tiền COD.<br>- Tính tổng số đơn và tổng tiền COD đã thu.<br>- Hỗ trợ phân trang.<br>- Tìm kiếm theo mã đơn. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper truy cập lịch sử giao hàng.<br>2. Bước 1: Chọn khoảng thời gian cần xem.<br>3. Bước 2: Hệ thống lấy các shipment đã hoàn thành.<br>4. Bước 3: Hiển thị danh sách với phân trang.<br>5. Bước 4: Hiển thị tổng số đơn và tổng tiền.<br>6. Kết thúc: Shipper xem chi tiết từng đơn. |

### 2.13 Xem thu nhập

| Tên usecase | Xem thu nhập |
|-------------|--------------|
| **Mục đích** | Cho phép shipper xem thu nhập từ việc giao hàng. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xem tổng thu nhập, số tiền COD đã thu và số dư hiện tại. |
| **Các quy tắc nghiệp vụ** | - Hiển thị số dư hiện tại trong ví shipper.<br>- Hiển thị tổng tiền COD đã thu chưa nộp.<br>- Tính lương theo số đơn giao thành công.<br>- Hiển thị chi tiết từng giao dịch.<br>- Lọc theo thời gian.<br>- Thống kê theo ngày/tuần/tháng. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper truy cập trang thu nhập.<br>2. Bước 1: Hiển thị số dư ví hiện tại.<br>3. Bước 2: Hiển thị tổng tiền COD chưa nộp.<br>4. Bước 3: Hiển thị lương dự kiến trong tháng.<br>5. Bước 4: Shipper chọn khoảng thời gian.<br>6. Bước 5: Hiển thị biểu đồ thu nhập.<br>7. Kết thúc: Shipper xem chi tiết giao dịch. |

### 2.14 Xem chi tiết giao dịch

| Tên usecase | Xem chi tiết giao dịch |
|-------------|-----------------------|
| **Mục đích** | Cho phép shipper xem chi tiết các giao dịch thu/chi trong ví. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xem lịch sử giao dịch: tiền COD thu được, tiền nộp về công ty, tiền lương nhận. |
| **Các quy tắc nghiệp vụ** | - Các loại giao dịch: COD_COLLECTED, COD_REMITTED, SALARY_PAID.<br>- Mỗi giao dịch có: số tiền, loại, thời gian, mô tả.<br>- Lọc theo loại và thời gian.<br>- Hỗ trợ phân trang.<br>- Export báo cáo PDF. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper chọn xem chi tiết giao dịch.<br>2. Bước 1: Hệ thống lấy transaction history.<br>3. Bước 2: Shipper chọn bộ lọc.<br>4. Bước 3: Hiển thị danh sách giao dịch.<br>5. Bước 4: Xem chi tiết từng giao dịch.<br>6. Kết thúc: Có thể export báo cáo. |

### 2.15 Xem thống kê hiệu suất

| Tên usecase | Xem thống kê hiệu suất |
|-------------|-----------------------|
| **Mục đích** | Cho phép shipper xem thống kê hiệu suất làm việc của mình. |
| **Tác nhân** | Shipper |
| **Mô tả** | Shipper xem các chỉ số: số đơn giao thành công, tỷ lệ giao đúng hạn, rating. |
| **Các quy tắc nghiệp vụ** | - Thống kê số đơn giao thành công/thất bại.<br>- Tính tỷ lệ giao đúng hạn (on-time delivery rate).<br>- Hiển thị rating trung bình từ khách hàng.<br>- So sánh với shipper khác trong công ty.<br>- Thống kê theo thời gian.<br>- Biểu đồ xu hướng hiệu suất. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper truy cập trang thống kê.<br>2. Bước 1: Chọn khoảng thời gian.<br>3. Bước 2: Hệ thống tính toán các chỉ số.<br>4. Bước 3: Hiển thị dashboard với biểu đồ.<br>5. Bước 4: Hiển thị so sánh với trung bình công ty.<br>6. Kết thúc: Shipper xem insight về hiệu suất. |

### 2.16 Yêu cầu hỗ trợ

| Tên usecase | Yêu cầu hỗ trợ |
|-------------|----------------|
| **Mục đích** | Cho phép shipper yêu cầu hỗ trợ từ Manager khi gặp khó khăn. |
| **Tác nhân** | Shipper, Express Manager |
| **Mô tả** | Shipper tạo ticket yêu cầu hỗ trợ về các vấn đề kỹ thuật, địa chỉ, hoặc khách hàng. |
| **Các quy tắc nghiệp vụ** | - Chọn loại hỗ trợ: TECHNICAL, ADDRESS_ISSUE, CUSTOMER_ISSUE.<br>- Nhập mô tả chi tiết vấn đề.<br>- Upload ảnh/video nếu cần.<br>- Ticket được gửi đến Manager.<br>- Manager phản hồi trong thời gian quy định.<br>- Cập nhật trạng thái ticket: OPEN, IN_PROGRESS, RESOLVED. |
| **Luồng Cơ bản** | 1. Mở đầu: Shipper chọn "Yêu cầu hỗ trợ".<br>2. Bước 1: Chọn loại vấn đề cần hỗ trợ.<br>3. Bước 2: Nhập mô tả chi tiết.<br>4. Bước 3: Upload ảnh/video (optional).<br>5. Bước 4: Hệ thống tạo support ticket.<br>6. Bước 5: Gửi notification cho Manager.<br>7. Bước 6: Manager xem và phản hồi.<br>8. Kết thúc: Shipper nhận được hỗ trợ. |

---

## 3. API Endpoints cho Shipper

### 3.1 Shipper Registration & Profile
- **POST** `/api/logistics/shippers/register` - Đăng ký shipper (với upload ảnh CMND, bằng lái)
- **GET** `/api/logistics/shippers/{id}` - Xem thông tin shipper
- **PUT** `/api/logistics/shippers/{id}` - Cập nhật thông tin shipper
- **GET** `/api/logistics/shippers/statistics` - Xem thống kê shipper

### 3.2 Shipment Order Management
- **GET** `/api/logistics/shipment-orders` - Lấy danh sách đơn hàng (có filter theo shipper, status)
- **GET** `/api/logistics/shipment-orders/{id}` - Xem chi tiết đơn hàng
- **PUT** `/api/logistics/shipment-orders/{id}/status` - Cập nhật trạng thái giao hàng
- **GET** `/api/logistics/shipment-orders/{shipperId}/orders` - Lấy tất cả đơn của shipper
- **GET** `/api/logistics/shipment-orders/{shipperId}/delivered-orders` - Lấy đơn đã giao (theo ngày)

### 3.3 Shipper Balance & Transactions
- **GET** `/api/logistics/shipper-balance/{shipperId}` - Xem số dư ví shipper
- **GET** `/api/logistics/shipper-transactions` - Xem lịch sử giao dịch
- **POST** `/api/logistics/shipper-transactions/cod-collected` - Ghi nhận tiền COD đã thu
- **POST** `/api/logistics/shipper-transactions/remit-cod` - Nộp tiền COD về công ty

### 3.4 Shipment Tracking & Logs
- **POST** `/api/logistics/shipment-logs` - Tạo log tracking
- **GET** `/api/logistics/shipment-logs/shipment/{shipmentId}` - Xem lịch sử tracking đơn hàng
- **POST** `/api/logistics/shipment-logs/location` - Cập nhật vị trí GPS

### 3.5 Issue Reporting
- **POST** `/api/logistics/shipment-issues` - Báo cáo vấn đề giao hàng
- **GET** `/api/logistics/shipment-issues/shipper/{shipperId}` - Xem các issue của shipper
- **PUT** `/api/logistics/shipment-issues/{issueId}` - Cập nhật trạng thái issue

---

## 4. Luồng nghiệp vụ chính của Shipper

### 4.1 Luồng đăng ký và kích hoạt
```
Tạo tài khoản User → Đăng ký Shipper → Upload CMND/Bằng lái 
→ Chọn công ty vận chuyển → Chờ Manager duyệt → ACTIVE → Bắt đầu làm việc
```

### 4.2 Luồng giao hàng cơ bản
```
Nhận đơn từ Manager (ASSIGNED) → Đến lấy hàng → Quét QR/Cập nhật PICKED_UP 
→ Đang giao hàng (IN_TRANSIT) → Đến địa chỉ khách → Giao hàng 
→ Thu tiền COD (nếu có) → Quét QR/Cập nhật DELIVERED → Hoàn thành
```

### 4.3 Luồng xử lý vấn đề
```
Gặp vấn đề khi giao → Báo cáo issue → Upload ảnh minh chứng 
→ Cập nhật FAILED/RETURNED → Manager xử lý → Lên lịch giao lại hoặc hoàn hàng
```

### 4.4 Luồng quản lý tiền COD
```
Giao hàng COD thành công → Ghi nhận tiền đã thu → Tích lũy trong ví 
→ Cuối ca/ngày: Nộp tiền về công ty → Được trả lương định kỳ
```

---

**Ghi chú:**
- Shipper cần được Manager hoặc Admin phê duyệt trước khi hoạt động
- Sử dụng GPS tracking real-time để theo dõi vị trí shipper
- Mã QR được generate cho mỗi shipment order để scan nhanh
- COD amount được quản lý chặt chẽ qua shipper balance system
- Tất cả thao tác quan trọng đều tạo shipment log để audit
