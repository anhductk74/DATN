# Sơ đồ Use Case và Đặc tả cho Actor SHOP (Chủ cửa hàng)

## 1. Sơ đồ Use Case

```
                                    ┌─────────────────────────────────┐
                                    │   Hệ thống Smart Mall           │
                                    └─────────────────────────────────┘
                                                    │
        ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
        │                                           │                                           │
    ┌───▼────┐                                      │                                           │
    │ Đăng   │                                      │                                           │
    │ nhập   │                                      │                                           │
    └────────┘                                      │                                           │
                                                    │                                           │
    ┌──────────┐                            ┌───────▼─────────┐                                 │
    │Quản lý   │◄───────────────────────────┤                 │         ┌──────────────┐        │
    │cửa hàng  │                            │                 │◄────────┤Tạo cửa hàng  │        │
    └──────────┘                            │                 │         └──────────────┘        │
        │                                   │                 │                                 │
    ┌───▼────┐                              │                 │         ┌──────────────┐        │
    │Cập nhật│                              │                 │◄────────┤Xem thống kê  │        │
    │thông tin                               │      SHOP       │         │cửa hàng      │        │
    │shop    │                              │    (OWNER)      │         └──────────────┘        │
    └────────┘                              │                 │                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Quản lý sản   │        │
    │Quản lý   │◄───────────────────────────┤                 │         │phẩm          │        │
    │sản phẩm  │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Thêm sản phẩm │        │
    │Sửa sản │                              │                 │         └──────────────┘        │
    │phẩm    │                              │                 │                                 │
    └────────┘                              │                 │         ┌──────────────┐        │
        │                                   │                 │◄────────┤Xóa sản phẩm  │        │
    ┌───▼────┐                              │                 │         └──────────────┘        │
    │Cập nhật│                              │                 │                                 │
    │tồn kho │                              │                 │         ┌──────────────┐        │
    └────────┘                              │                 │◄────────┤Quản lý đơn   │        │
                                            │                 │         │hàng          │        │
    ┌──────────┐                            │                 │         └──────────────┘        │
    │Xem đơn   │◄───────────────────────────┤                 │                                 │
    │hàng      │                            │                 │         ┌──────────────┐        │
    └──────────┘                            │                 │◄────────┤Xác nhận đơn  │        │
        │                                   │                 │         │hàng          │        │
    ┌───▼────┐                              │                 │         └──────────────┘        │
    │Cập nhật│                              │                 │                                 │
    │trạng   │                              │                 │         ┌──────────────┐        │
    │thái đơn│                              │                 │◄────────┤Xử lý yêu cầu │        │
    └────────┘                              │                 │         │hoàn trả      │        │
                                            │                 │         └──────────────┘        │
    ┌──────────┐                            │                 │                                 │
    │Quản lý   │◄───────────────────────────┤                 │         ┌──────────────┐        │
    │ví tiền   │                            │                 │◄────────┤Xem đánh giá  │        │
    └──────────┘                            │                 │         │sản phẩm      │        │
        │                                   │                 │         └──────────────┘        │
    ┌───▼────┐                              │                 │                                 │
    │Cập nhật│                              │                 │         ┌──────────────┐        │
    │thông tin                               │                 │◄────────┤Trả lời đánh  │        │
    │ngân hàng                               │                 │         │giá           │        │
    └────────┘                              │                 │         └──────────────┘        │
        │                                   │                 │                                 │
    ┌───▼────┐                              │                 │                                 │
    │Yêu cầu │                              │                 │                                 │
    │rút tiền│                              └─────────────────┘                                 │
    └────────┘                                                                                  │
        │                                                                                       │
    ┌───▼────┐                                                                                  │
    │Xem lịch│                                                                                  │
    │sử giao │                                                                                  │
    │dịch    │                                                                                  │
    └────────┘                                                                                  │
                                                                                                │
    ┌──────────┐                                                                                │
    │Xem báo   │                                                                                │
    │cáo doanh │                                                                                │
    │thu       │                                                                                │
    └──────────┘                                                                                │
                                                                                                │
                                    ┌───────────────────────────────────────────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │  Admin System  │
                            │   (Approval)   │
                            └────────────────┘
```

## 2. Đặc tả Use Case theo cấu trúc

### 2.1 Đăng nhập

| Tên usecase | Đăng nhập |
|-------------|-----------|
| **Mục đích** | Cho phép chủ cửa hàng truy cập vào hệ thống quản lý shop. |
| **Tác nhân** | Shop Owner (Chủ cửa hàng) |
| **Mô tả** | Chủ cửa hàng đăng nhập vào hệ thống để quản lý cửa hàng, sản phẩm và đơn hàng. |
| **Các quy tắc nghiệp vụ** | - Tài khoản phải có role USER hoặc ADMIN.<br>- Sau khi đăng nhập, chủ shop có thể tạo và quản lý cửa hàng.<br>- JWT token được sử dụng để xác thực.<br>- Hỗ trợ đăng nhập qua email/password hoặc Google OAuth2. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang đăng nhập.<br>2. Bước 1: Hệ thống hiển thị form đăng nhập.<br>3. Bước 2: Chủ shop nhập thông tin đăng nhập.<br>4. Bước 3: Hệ thống xác thực và trả về JWT token.<br>5. Bước 4: Chủ shop được chuyển đến trang quản lý shop.<br>6. Kết thúc: Đăng nhập thành công. |

### 2.2 Tạo cửa hàng

| Tên usecase | Tạo cửa hàng |
|-------------|--------------|
| **Mục đích** | Cho phép người dùng tạo cửa hàng mới trên nền tảng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop cung cấp thông tin cửa hàng (tên, mô tả, địa chỉ, logo) để tạo shop mới. |
| **Các quy tắc nghiệp vụ** | - Tên shop phải duy nhất trong hệ thống.<br>- Phải upload logo/hình ảnh đại diện cho shop.<br>- Logo được upload lên Cloudinary.<br>- Mặc định shop được tạo với status ACTIVE.<br>- Tự động khởi tạo view count = 0.<br>- Lưu thông tin owner (userId) khi tạo shop. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang tạo cửa hàng.<br>2. Bước 1: Hệ thống hiển thị form tạo shop.<br>3. Bước 2: Chủ shop điền thông tin: tên, mô tả, địa chỉ và upload logo.<br>4. Bước 3: Hệ thống validate dữ liệu và kiểm tra tên shop trùng lặp.<br>5. Bước 4: Upload logo lên Cloudinary và lưu URL.<br>6. Bước 5: Tạo shop mới trong database với ownerId.<br>7. Kết thúc: Trả về thông tin shop đã tạo. |

### 2.3 Quản lý cửa hàng

| Tên usecase | Quản lý cửa hàng |
|-------------|------------------|
| **Mục đích** | Cho phép chủ shop xem và cập nhật thông tin cửa hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop có thể xem thông tin chi tiết shop, cập nhật thông tin và xem thống kê. |
| **Các quy tắc nghiệp vụ** | - Chỉ chủ shop mới có quyền cập nhật thông tin shop của mình.<br>- Có thể cập nhật: tên, mô tả, địa chỉ, logo.<br>- Không thể thay đổi owner sau khi tạo.<br>- Hiển thị view count (số lượt xem shop).<br>- Hiển thị số lượng sản phẩm của shop. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang quản lý shop.<br>2. Bước 1: Hệ thống kiểm tra quyền sở hữu shop.<br>3. Bước 2: Hiển thị thông tin chi tiết shop.<br>4. Bước 3: Chủ shop chỉnh sửa thông tin và upload logo mới (nếu có).<br>5. Bước 4: Hệ thống validate và upload logo lên Cloudinary.<br>6. Bước 5: Cập nhật thông tin shop trong database.<br>7. Kết thúc: Hiển thị thông tin đã cập nhật. |

### 2.4 Xem thống kê cửa hàng

| Tên usecase | Xem thống kê cửa hàng |
|-------------|-----------------------|
| **Mục đích** | Cho phép chủ shop xem các chỉ số thống kê về cửa hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem số lượt xem shop, số lượng sản phẩm, đơn hàng và doanh thu. |
| **Các quy tắc nghiệp vụ** | - Hiển thị view count của shop.<br>- Thống kê số lượng sản phẩm theo trạng thái.<br>- Thống kê đơn hàng theo trạng thái.<br>- Hiển thị doanh thu theo thời gian.<br>- Chỉ chủ shop hoặc Admin mới xem được. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang thống kê.<br>2. Bước 1: Hệ thống kiểm tra quyền truy cập.<br>3. Bước 2: Tính toán các chỉ số thống kê.<br>4. Bước 3: Hiển thị dashboard với các biểu đồ và số liệu.<br>5. Kết thúc: Chủ shop xem được tổng quan về shop. |

### 2.5 Quản lý sản phẩm

| Tên usecase | Quản lý sản phẩm |
|-------------|------------------|
| **Mục đích** | Cho phép chủ shop quản lý danh sách sản phẩm của cửa hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop có thể xem, thêm, sửa, xóa sản phẩm và quản lý biến thể sản phẩm. |
| **Các quy tắc nghiệp vụ** | - Chỉ hiển thị sản phẩm của shop mình.<br>- Sản phẩm có các trạng thái: ACTIVE, INACTIVE, DELETED.<br>- Hỗ trợ phân trang khi xem danh sách.<br>- Có thể tìm kiếm sản phẩm theo tên.<br>- Mỗi sản phẩm phải thuộc một danh mục. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang quản lý sản phẩm.<br>2. Bước 1: Hệ thống lấy danh sách sản phẩm của shop với phân trang.<br>3. Bước 2: Hiển thị danh sách sản phẩm với thông tin cơ bản.<br>4. Bước 3: Chủ shop chọn thao tác: xem chi tiết, sửa, xóa hoặc thêm mới.<br>5. Kết thúc: Danh sách sản phẩm được cập nhật. |

### 2.6 Thêm sản phẩm

| Tên usecase | Thêm sản phẩm |
|-------------|---------------|
| **Mục đích** | Cho phép chủ shop thêm sản phẩm mới vào cửa hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop tạo sản phẩm mới với thông tin chi tiết, hình ảnh và biến thể. |
| **Các quy tắc nghiệp vụ** | - Phải cung cấp: tên, mô tả, giá, danh mục, shop.<br>- Upload nhiều hình ảnh sản phẩm (lên Cloudinary).<br>- Tạo các biến thể sản phẩm (size, màu, số lượng tồn kho).<br>- Mặc định trạng thái là ACTIVE.<br>- Tự động tính rating trung bình = 0.<br>- Validate giá phải > 0. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn thêm sản phẩm mới.<br>2. Bước 1: Hệ thống hiển thị form tạo sản phẩm.<br>3. Bước 2: Chủ shop điền thông tin sản phẩm và chọn danh mục.<br>4. Bước 3: Upload hình ảnh sản phẩm (tối đa 10 ảnh).<br>5. Bước 4: Thêm các biến thể (size, color, stock).<br>6. Bước 5: Hệ thống upload ảnh lên Cloudinary.<br>7. Bước 6: Tạo sản phẩm và biến thể trong database.<br>8. Kết thúc: Sản phẩm mới được thêm vào shop. |

### 2.7 Sửa sản phẩm

| Tên usecase | Sửa sản phẩm |
|-------------|--------------|
| **Mục đích** | Cho phép chủ shop cập nhật thông tin sản phẩm. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop chỉnh sửa thông tin sản phẩm, hình ảnh và biến thể. |
| **Các quy tắc nghiệp vụ** | - Chỉ chủ shop mới sửa được sản phẩm của mình.<br>- Có thể cập nhật: tên, mô tả, giá, danh mục, trạng thái.<br>- Có thể thêm/xóa/sửa hình ảnh.<br>- Có thể cập nhật biến thể (thêm mới, sửa tồn kho).<br>- Không thể thay đổi shop owner. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn sản phẩm cần sửa.<br>2. Bước 1: Hệ thống kiểm tra quyền sở hữu sản phẩm.<br>3. Bước 2: Hiển thị form chỉnh sửa với thông tin hiện tại.<br>4. Bước 3: Chủ shop cập nhật thông tin cần thiết.<br>5. Bước 4: Upload ảnh mới (nếu có) lên Cloudinary.<br>6. Bước 5: Cập nhật database.<br>7. Kết thúc: Sản phẩm được cập nhật thành công. |

### 2.8 Xóa sản phẩm

| Tên usecase | Xóa sản phẩm |
|-------------|--------------|
| **Mục đích** | Cho phép chủ shop xóa sản phẩm khỏi cửa hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop thực hiện xóa mềm (soft delete) sản phẩm. |
| **Các quy tắc nghiệp vụ** | - Sử dụng soft delete (đánh dấu deletedAt).<br>- Sản phẩm đã xóa không hiển thị cho khách hàng.<br>- Chỉ chủ shop hoặc Admin mới xóa được.<br>- Có thể khôi phục sản phẩm đã xóa.<br>- Không xóa vật lý khỏi database. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn xóa sản phẩm.<br>2. Bước 1: Hệ thống hiển thị xác nhận xóa.<br>3. Bước 2: Chủ shop xác nhận xóa.<br>4. Bước 3: Hệ thống đánh dấu deletedAt = current timestamp.<br>5. Bước 4: Cập nhật trạng thái sản phẩm.<br>6. Kết thúc: Sản phẩm bị ẩn khỏi danh sách. |

### 2.9 Cập nhật tồn kho

| Tên usecase | Cập nhật tồn kho |
|-------------|------------------|
| **Mục đích** | Cho phép chủ shop cập nhật số lượng tồn kho của biến thể sản phẩm. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop thay đổi số lượng tồn kho cho từng biến thể sản phẩm. |
| **Các quy tắc nghiệp vụ** | - Số lượng tồn kho phải >= 0.<br>- Cập nhật theo từng product variant (size, color).<br>- Tự động cập nhật trạng thái hết hàng nếu stock = 0.<br>- Ghi log lịch sử thay đổi tồn kho.<br>- Cảnh báo khi tồn kho thấp. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập quản lý tồn kho.<br>2. Bước 1: Hiển thị danh sách biến thể và tồn kho hiện tại.<br>3. Bước 2: Chủ shop nhập số lượng mới.<br>4. Bước 3: Hệ thống validate số lượng >= 0.<br>5. Bước 4: Cập nhật stock trong database.<br>6. Bước 5: Ghi log thay đổi.<br>7. Kết thúc: Tồn kho được cập nhật. |

### 2.10 Quản lý đơn hàng

| Tên usecase | Quản lý đơn hàng |
|-------------|------------------|
| **Mục đích** | Cho phép chủ shop xem và quản lý đơn hàng của cửa hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem danh sách đơn hàng, chi tiết đơn hàng và lọc theo trạng thái. |
| **Các quy tắc nghiệp vụ** | - Chỉ hiển thị đơn hàng có sản phẩm của shop mình.<br>- Lọc theo trạng thái: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED.<br>- Hỗ trợ phân trang.<br>- Hiển thị thông tin: khách hàng, sản phẩm, tổng tiền, địa chỉ giao hàng.<br>- Tìm kiếm theo mã đơn hàng. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang quản lý đơn hàng.<br>2. Bước 1: Hệ thống lấy danh sách đơn hàng của shop.<br>3. Bước 2: Chủ shop chọn bộ lọc (trạng thái, ngày).<br>4. Bước 3: Hiển thị danh sách đơn hàng phân trang.<br>5. Bước 4: Chủ shop chọn xem chi tiết đơn hàng.<br>6. Kết thúc: Hiển thị thông tin đầy đủ đơn hàng. |

### 2.11 Xác nhận đơn hàng

| Tên usecase | Xác nhận đơn hàng |
|-------------|-------------------|
| **Mục đích** | Cho phép chủ shop xác nhận đơn hàng mới. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xác nhận đơn hàng từ PENDING sang CONFIRMED để chuẩn bị giao hàng. |
| **Các quy tắc nghiệp vụ** | - Chỉ xác nhận được đơn hàng ở trạng thái PENDING.<br>- Kiểm tra tồn kho trước khi xác nhận.<br>- Cập nhật trạng thái đơn hàng thành CONFIRMED.<br>- Tạo order tracking log.<br>- Gửi thông báo cho khách hàng.<br>- Chuẩn bị tạo shipment order. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn đơn hàng cần xác nhận.<br>2. Bước 1: Hệ thống kiểm tra trạng thái đơn hàng = PENDING.<br>3. Bước 2: Kiểm tra tồn kho các sản phẩm.<br>4. Bước 3: Chủ shop xác nhận đơn hàng.<br>5. Bước 4: Cập nhật trạng thái thành CONFIRMED.<br>6. Bước 5: Tạo tracking log.<br>7. Bước 6: Gửi notification cho khách.<br>8. Kết thúc: Đơn hàng chuyển sang trạng thái CONFIRMED. |

### 2.12 Xử lý yêu cầu hoàn trả

| Tên usecase | Xử lý yêu cầu hoàn trả |
|-------------|------------------------|
| **Mục đích** | Cho phép chủ shop xem và xử lý yêu cầu hoàn trả/đổi hàng từ khách hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem danh sách yêu cầu hoàn trả, xem chi tiết và cập nhật trạng thái. |
| **Các quy tắc nghiệp vụ** | - Chỉ xem yêu cầu hoàn trả của đơn hàng shop mình.<br>- Xem hình ảnh minh chứng từ khách hàng.<br>- Cập nhật trạng thái: PENDING → APPROVED/REJECTED.<br>- Nếu APPROVED, tiến hành hoàn tiền cho khách.<br>- Ghi nhận lý do reject (nếu từ chối).<br>- Admin có thể can thiệp nếu có tranh chấp. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang quản lý hoàn trả.<br>2. Bước 1: Hiển thị danh sách yêu cầu hoàn trả của shop.<br>3. Bước 2: Chủ shop chọn xem chi tiết yêu cầu.<br>4. Bước 3: Xem thông tin: lý do, hình ảnh, đơn hàng.<br>5. Bước 4: Chủ shop chọn APPROVE hoặc REJECT.<br>6. Bước 5: Nhập lý do (nếu reject).<br>7. Bước 6: Hệ thống cập nhật trạng thái.<br>8. Bước 7: Nếu APPROVED, xử lý hoàn tiền.<br>9. Kết thúc: Thông báo kết quả cho khách hàng. |

### 2.13 Xem đánh giá sản phẩm

| Tên usecase | Xem đánh giá sản phẩm |
|-------------|-----------------------|
| **Mục đích** | Cho phép chủ shop xem đánh giá của khách hàng về sản phẩm. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem tất cả đánh giá của sản phẩm trong shop, thống kê rating. |
| **Các quy tắc nghiệp vụ** | - Hiển thị đánh giá của tất cả sản phẩm trong shop.<br>- Lọc theo rating (1-5 sao).<br>- Xem hình ảnh/video trong đánh giá.<br>- Thống kê rating trung bình.<br>- Phân trang danh sách đánh giá.<br>- Có thể trả lời đánh giá. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang đánh giá sản phẩm.<br>2. Bước 1: Hệ thống lấy tất cả đánh giá của shop.<br>3. Bước 2: Hiển thị danh sách đánh giá với phân trang.<br>4. Bước 3: Chủ shop lọc theo sản phẩm hoặc rating.<br>5. Bước 4: Xem chi tiết từng đánh giá.<br>6. Kết thúc: Chủ shop có thể trả lời đánh giá. |

### 2.14 Trả lời đánh giá

| Tên usecase | Trả lời đánh giá |
|-------------|------------------|
| **Mục đích** | Cho phép chủ shop phản hồi đánh giá của khách hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop viết phản hồi cho đánh giá sản phẩm của khách hàng. |
| **Các quy tắc nghiệp vụ** | - Chỉ trả lời đánh giá của sản phẩm trong shop mình.<br>- Mỗi đánh giá chỉ có 1 reply từ shop.<br>- Có thể sửa reply đã gửi.<br>- Reply được hiển thị ngay dưới đánh giá.<br>- Khách hàng nhận thông báo khi shop trả lời. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn trả lời đánh giá.<br>2. Bước 1: Hệ thống kiểm tra quyền trả lời.<br>3. Bước 2: Hiển thị form nhập reply.<br>4. Bước 3: Chủ shop viết nội dung trả lời.<br>5. Bước 4: Hệ thống lưu reply vào database.<br>6. Bước 5: Gửi thông báo cho khách hàng.<br>7. Kết thúc: Reply được hiển thị công khai. |

### 2.15 Quản lý ví tiền

| Tên usecase | Quản lý ví tiền |
|-------------|-----------------|
| **Mục đích** | Cho phép chủ shop quản lý ví điện tử và số dư của shop. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem số dư ví, lịch sử giao dịch và tạo yêu cầu rút tiền. |
| **Các quy tắc nghiệp vụ** | - Mỗi shop có một ví duy nhất.<br>- Ví có 2 loại số dư: available (có thể rút) và pending (đang chờ).<br>- Số dư tăng khi đơn hàng DELIVERED.<br>- Số dư giảm khi rút tiền hoặc hoàn trả.<br>- Phải cung cấp thông tin ngân hàng để rút tiền.<br>- Admin phê duyệt yêu cầu rút tiền. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang quản lý ví.<br>2. Bước 1: Hiển thị số dư available và pending.<br>3. Bước 2: Hiển thị thông tin ngân hàng đã đăng ký.<br>4. Bước 3: Chủ shop xem lịch sử giao dịch.<br>5. Kết thúc: Có thể tạo yêu cầu rút tiền. |

### 2.16 Cập nhật thông tin ngân hàng

| Tên usecase | Cập nhật thông tin ngân hàng |
|-------------|------------------------------|
| **Mục đích** | Cho phép chủ shop cập nhật hoặc thêm thông tin tài khoản ngân hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop cung cấp thông tin ngân hàng để nhận tiền khi rút. |
| **Các quy tắc nghiệp vụ** | - Phải có: tên ngân hàng, số tài khoản, tên chủ tài khoản.<br>- Validate số tài khoản hợp lệ.<br>- Tên chủ tài khoản phải khớp với tên shop owner.<br>- Có thể cập nhật thông tin ngân hàng bất kỳ lúc nào.<br>- Thông tin được mã hóa khi lưu trữ. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn cập nhật thông tin ngân hàng.<br>2. Bước 1: Hệ thống hiển thị form nhập thông tin.<br>3. Bước 2: Chủ shop điền: tên ngân hàng, số TK, tên chủ TK.<br>4. Bước 3: Hệ thống validate thông tin.<br>5. Bước 4: Lưu thông tin ngân hàng đã mã hóa.<br>6. Kết thúc: Thông báo cập nhật thành công. |

### 2.17 Yêu cầu rút tiền

| Tên usecase | Yêu cầu rút tiền |
|-------------|------------------|
| **Mục đích** | Cho phép chủ shop tạo yêu cầu rút tiền từ ví về tài khoản ngân hàng. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop tạo yêu cầu rút một số tiền từ số dư available trong ví. |
| **Các quy tắc nghiệp vụ** | - Số tiền rút phải <= số dư available.<br>- Số tiền rút tối thiểu: 100,000 VND.<br>- Phải có thông tin ngân hàng hợp lệ.<br>- Trạng thái yêu cầu: PENDING → APPROVED/REJECTED.<br>- Admin phê duyệt trong vòng 1-3 ngày làm việc.<br>- Khi APPROVED, số tiền chuyển từ available sang processing. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop chọn tạo yêu cầu rút tiền.<br>2. Bước 1: Hệ thống kiểm tra số dư available.<br>3. Bước 2: Kiểm tra thông tin ngân hàng đã có chưa.<br>4. Bước 3: Chủ shop nhập số tiền muốn rút.<br>5. Bước 4: Hệ thống validate số tiền.<br>6. Bước 5: Tạo withdrawal request với trạng thái PENDING.<br>7. Bước 6: Trừ số tiền từ available, chuyển sang processing.<br>8. Kết thúc: Gửi yêu cầu đến Admin để duyệt. |

### 2.18 Xem lịch sử giao dịch

| Tên usecase | Xem lịch sử giao dịch |
|-------------|-----------------------|
| **Mục đích** | Cho phép chủ shop xem lịch sử các giao dịch trong ví. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem tất cả giao dịch thu/chi của ví theo thời gian. |
| **Các quy tắc nghiệp vụ** | - Hiển thị các loại giao dịch: ORDER_PAYMENT, WITHDRAWAL, REFUND.<br>- Mỗi giao dịch có: số tiền, loại, thời gian, mô tả.<br>- Lọc theo loại giao dịch và khoảng thời gian.<br>- Hỗ trợ phân trang.<br>- Hiển thí số dư sau mỗi giao dịch. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập lịch sử giao dịch.<br>2. Bước 1: Hệ thống lấy danh sách giao dịch của wallet.<br>3. Bước 2: Chủ shop chọn bộ lọc (ngày, loại).<br>4. Bước 3: Hiển thị danh sách giao dịch phân trang.<br>5. Bước 4: Xem chi tiết từng giao dịch.<br>6. Kết thúc: Có thể export báo cáo. |

### 2.19 Xem báo cáo doanh thu

| Tên usecase | Xem báo cáo doanh thu |
|-------------|-----------------------|
| **Mục đích** | Cho phép chủ shop xem báo cáo thống kê doanh thu theo thời gian. |
| **Tác nhân** | Shop Owner |
| **Mô tả** | Chủ shop xem thống kê doanh thu, số đơn hàng và lợi nhuận theo ngày/tháng/năm. |
| **Các quy tắc nghiệp vụ** | - Thống kê theo khoảng thời gian tùy chỉnh.<br>- Hiển thị: tổng doanh thu, số đơn hàng, giá trị trung bình đơn.<br>- Biểu đồ doanh thu theo thời gian.<br>- So sánh với kỳ trước.<br>- Thống kê sản phẩm bán chạy nhất.<br>- Export báo cáo PDF/Excel. |
| **Luồng Cơ bản** | 1. Mở đầu: Chủ shop truy cập trang báo cáo.<br>2. Bước 1: Chọn khoảng thời gian cần xem.<br>3. Bước 2: Hệ thống tính toán các chỉ số thống kê.<br>4. Bước 3: Hiển thị dashboard với biểu đồ.<br>5. Bước 4: Hiển thị top sản phẩm bán chạy.<br>6. Kết thúc: Chủ shop có thể export báo cáo. |

---

## 3. API Endpoints cho Shop Owner

### 3.1 Shop Management
- **POST** `/api/shop/create` - Tạo cửa hàng mới
- **GET** `/api/shop/{id}` - Xem thông tin shop
- **PUT** `/api/shop/{id}` - Cập nhật thông tin shop
- **DELETE** `/api/shop/{id}` - Xóa shop
- **GET** `/api/shop/owner/{ownerId}` - Lấy shop theo owner
- **GET** `/api/shop/{id}/view-count` - Xem số lượt xem shop
- **POST** `/api/shop/{id}/view` - Tăng view count

### 3.2 Product Management
- **POST** `/api/products/create` - Thêm sản phẩm mới (với ảnh)
- **POST** `/api/products/create-simple` - Thêm sản phẩm (không ảnh)
- **GET** `/api/products/{id}` - Xem chi tiết sản phẩm
- **PUT** `/api/products/{id}` - Cập nhật sản phẩm
- **DELETE** `/api/products/{id}` - Xóa sản phẩm
- **GET** `/api/products/shop/{shopId}` - Lấy sản phẩm của shop
- **GET** `/api/products/shop/{shopId}/paged` - Lấy sản phẩm shop (phân trang)
- **GET** `/api/products/deleted` - Xem sản phẩm đã xóa
- **PUT** `/api/products/{id}/restore` - Khôi phục sản phẩm đã xóa

### 3.3 Order Management
- **GET** `/api/orders/shop/{shopId}` - Lấy đơn hàng của shop (có filter)
- **GET** `/api/orders/{id}` - Xem chi tiết đơn hàng
- **PUT** `/api/orders/status` - Cập nhật trạng thái đơn hàng

### 3.4 Return Request Management
- **GET** `/api/orders/return-request/shop/{shopId}` - Lấy yêu cầu hoàn trả của shop
- **PUT** `/api/orders/return-request/{requestId}/shop-status` - Cập nhật trạng thái hoàn trả

### 3.5 Review Management
- **GET** `/api/reviews/shop/{shopId}` - Xem đánh giá của shop
- **POST** `/api/reviews/{reviewId}/reply` - Trả lời đánh giá
- **PUT** `/api/reviews/{reviewId}/reply` - Sửa reply
- **DELETE** `/api/reviews/{reviewId}/reply` - Xóa reply

### 3.6 Wallet Management
- **POST** `/api/wallets/shops/{shopId}` - Tạo ví cho shop
- **GET** `/api/wallets/shops/{shopId}` - Xem thông tin ví
- **PUT** `/api/wallets/shops/{shopId}/bank-info` - Cập nhật thông tin ngân hàng
- **POST** `/api/wallets/shops/{shopId}/withdrawal-requests` - Tạo yêu cầu rút tiền
- **GET** `/api/wallets/shops/{shopId}/withdrawal-requests` - Xem yêu cầu rút tiền
- **GET** `/api/wallets/shops/{shopId}/transactions` - Xem lịch sử giao dịch
- **GET** `/api/wallets/shops/{shopId}/statistics` - Xem thống kê ví

---

## 4. Luồng nghiệp vụ chính của Shop Owner

### 4.1 Luồng khởi tạo shop
```
Đăng ký/Đăng nhập → Tạo shop → Upload logo → Cập nhật thông tin ngân hàng 
→ Thêm sản phẩm → Sẵn sàng bán hàng
```

### 4.2 Luồng xử lý đơn hàng
```
Nhận đơn hàng mới (PENDING) → Kiểm tra tồn kho → Xác nhận đơn (CONFIRMED) 
→ Đóng gói → Chuyển cho đơn vị vận chuyển (SHIPPED) 
→ Khách nhận hàng (DELIVERED) → Tiền vào ví
```

### 4.3 Luồng rút tiền
```
Kiểm tra số dư ví → Cập nhật thông tin ngân hàng → Tạo yêu cầu rút tiền 
→ Chờ Admin duyệt → Nhận tiền vào tài khoản
```

### 4.4 Luồng xử lý hoàn trả
```
Nhận yêu cầu hoàn trả → Xem lý do và hình ảnh → Đánh giá yêu cầu 
→ Chấp nhận/Từ chối → Nếu chấp nhận: Hoàn tiền cho khách → Trừ tiền từ ví
```

---

**Ghi chú:**
- Shop Owner phải được xác thực qua JWT token
- Sử dụng `@PreAuthorize("@shopService.isShopOwner(#shopId, authentication)")` để kiểm tra quyền
- Upload hình ảnh qua Cloudinary
- Wallet system quản lý dòng tiền tự động
- Admin có quyền can thiệp vào mọi hoạt động của shop
