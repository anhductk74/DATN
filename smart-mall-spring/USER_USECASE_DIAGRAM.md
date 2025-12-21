# Sơ đồ Use Case và Đặc tả cho Actor USER

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
        │                                           │                                           │
    ┌───▼────┐                                      │                                           │
    │ Đăng   │                                      │                                           │
    │  ký    │                                      │                                           │
    └────────┘                              ┌───────▼─────────┐                                 │
                                            │                 │                                 │
    ┌──────────┐                            │                 │         ┌──────────────┐        │
    │Quản lý   │                            │                 │◄────────┤Tìm kiếm sản  │        │
    │thông tin │                            │                 │         │phẩm          │        │
    │cá nhân   │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Xem chi tiết  │        │
    │Đổi mật │                              │                 │         │sản phẩm      │        │
    │  khẩu  │                              │      USER       │         └──────────────┘        │
    └────────┘                              │                 │                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Quản lý giỏ   │        │
    │Quản lý   │◄───────────────────────────┤                 │         │hàng          │        │
    │địa chỉ   │                            │                 │         └──────────────┘        │
    │giao hàng │                            │                 │                                 │
    └──────────┘                            │                 │         ┌──────────────┐        │
                                            │                 │◄────────┤Quản lý danh  │        │
    ┌──────────┐                            │                 │         │sách yêu thích│        │
    │Đặt hàng  │◄───────────────────────────┤                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Đánh giá sản  │        │
    │Thanh   │                              │                 │         │phẩm          │        │
    │toán    │                              │                 │         └──────────────┘        │
    └────────┘                              │                 │                                 │
                                            │                 │         ┌──────────────┐        │
    ┌──────────┐                            │                 │◄────────┤Quản lý đơn   │        │
    │Quản lý   │◄───────────────────────────┤                 │         │hàng          │        │
    │đơn hàng  │                            │                 │         └──────────────┘        │
    └──────────┘                            │                 │                                 │
        │                                   │                 │         ┌──────────────┐        │
    ┌───▼────┐                              │                 │◄────────┤Hủy đơn hàng  │        │
    │Yêu cầu │                              │                 │         └──────────────┘        │
    │hoàn trả│                              │                 │                                 │
    └────────┘                              │                 │         ┌──────────────┐        │
                                            │                 │◄────────┤Sử dụng       │        │
    ┌──────────┐                            │                 │         │voucher       │        │
    │Xem cửa   │◄───────────────────────────┤                 │         └──────────────┘        │
    │hàng      │                            │                 │                                 │
    └──────────┘                            └─────────────────┘                                 │
                                                                                                │
                                                                                                │
                                    ┌───────────────────────────────────────────────────────────┘
                                    │
                            ┌───────▼────────┐
                            │   VNPay System │
                            │   (External)   │
                            └────────────────┘
```

## 2. Đặc tả Use Case theo cấu trúc

### 2.1 Đăng nhập

| Tên usecase | Đăng nhập |
|-------------|-----------|
| **Mục đích** | Cho phép Người dùng truy cập vào hệ thống bằng tài khoản đã đăng ký. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng cung cấp thông tin đăng nhập (tên tài khoản và mật khẩu) hoặc đăng nhập qua Google để xác thực và truy cập các chức năng của hệ thống. |
| **Các quy tắc nghiệp vụ** | - Tên đăng nhập và mật khẩu phải khớp với thông tin đã lưu trong cơ sở dữ liệu.<br>- Mật khẩu phải được mã hóa.<br>- Hỗ trợ đăng nhập qua Google OAuth2.<br>- Hỗ trợ đăng nhập mobile qua mã xác thực gửi email. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang đăng nhập.<br>2. Bước 1: Hệ thống hiển thị giao diện đăng nhập.<br>3. Bước 2: Người dùng nhập tên tài khoản và mật khẩu, sau đó nhấn nút "Đăng nhập".<br>4. Bước 3: Hệ thống xác thực thông tin đăng nhập.<br>5. Bước 4: Hệ thống trả về JWT token và thông tin người dùng.<br>6. Kết thúc: Người dùng được chuyển đến trang chủ với trạng thái đã đăng nhập. |

### 2.2 Đăng ký

| Tên usecase | Đăng ký |
|-------------|---------|
| **Mục đích** | Cho phép người dùng mới tạo tài khoản trong hệ thống. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng cung cấp thông tin cá nhân để tạo tài khoản mới và được cấp quyền truy cập vào hệ thống. |
| **Các quy tắc nghiệp vụ** | - Username phải là duy nhất trong hệ thống.<br>- Email phải hợp lệ và duy nhất.<br>- Mật khẩu phải được mã hóa trước khi lưu.<br>- Mặc định tài khoản mới có role USER.<br>- Admin có thể tạo tài khoản với các role khác. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang đăng ký.<br>2. Bước 1: Hệ thống hiển thị form đăng ký.<br>3. Bước 2: Người dùng điền thông tin (username, email, password, fullName, phoneNumber).<br>4. Bước 3: Hệ thống validate dữ liệu và kiểm tra trùng lặp.<br>5. Bước 4: Hệ thống tạo tài khoản mới và trả về JWT token.<br>6. Kết thúc: Người dùng được đăng nhập tự động sau khi đăng ký thành công. |

### 2.3 Quản lý thông tin cá nhân

| Tên usecase | Quản lý thông tin cá nhân |
|-------------|---------------------------|
| **Mục đích** | Cho phép người dùng xem và cập nhật thông tin cá nhân của mình. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng có thể xem, chỉnh sửa thông tin cá nhân như tên đầy đủ, số điện thoại, ảnh đại diện, giới tính, ngày sinh. |
| **Các quy tắc nghiệp vụ** | - Người dùng chỉ có thể xem và chỉnh sửa thông tin của chính mình.<br>- Ảnh đại diện được upload lên Cloudinary.<br>- Số điện thoại phải hợp lệ.<br>- Email không thể thay đổi sau khi đăng ký. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang hồ sơ cá nhân.<br>2. Bước 1: Hệ thống hiển thị thông tin hiện tại của người dùng.<br>3. Bước 2: Người dùng chỉnh sửa các thông tin cần thiết và upload ảnh đại diện (nếu có).<br>4. Bước 3: Hệ thống validate dữ liệu, upload ảnh lên Cloudinary và cập nhật database.<br>5. Bước 4: Hệ thống trả về thông tin đã được cập nhật.<br>6. Kết thúc: Thông báo cập nhật thành công. |

### 2.4 Đổi mật khẩu

| Tên usecase | Đổi mật khẩu |
|-------------|--------------|
| **Mục đích** | Cho phép người dùng thay đổi mật khẩu đăng nhập. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng cung cấp mật khẩu cũ và mật khẩu mới để thay đổi mật khẩu đăng nhập. |
| **Các quy tắc nghiệp vụ** | - Mật khẩu cũ phải đúng.<br>- Mật khẩu mới phải khác mật khẩu cũ.<br>- Mật khẩu mới phải đủ độ mạnh (tối thiểu 6 ký tự).<br>- Mật khẩu được mã hóa BCrypt. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập chức năng đổi mật khẩu.<br>2. Bước 1: Hệ thống hiển thị form đổi mật khẩu.<br>3. Bước 2: Người dùng nhập mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới.<br>4. Bước 3: Hệ thống xác thực mật khẩu cũ và validate mật khẩu mới.<br>5. Bước 4: Hệ thống cập nhật mật khẩu mới đã được mã hóa.<br>6. Kết thúc: Thông báo đổi mật khẩu thành công. |

### 2.5 Quản lý địa chỉ giao hàng

| Tên usecase | Quản lý địa chỉ giao hàng |
|-------------|---------------------------|
| **Mục đích** | Cho phép người dùng quản lý danh sách địa chỉ giao hàng. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng có thể thêm, xem, sửa, xóa địa chỉ giao hàng và đặt địa chỉ mặc định. |
| **Các quy tắc nghiệp vụ** | - Mỗi người dùng có thể có nhiều địa chỉ.<br>- Chỉ có một địa chỉ được đặt làm mặc định.<br>- Khi đặt địa chỉ mới làm mặc định, địa chỉ mặc định cũ tự động bị hủy.<br>- Địa chỉ phải có đầy đủ: tên người nhận, số điện thoại, tỉnh/thành phố, quận/huyện, phường/xã, địa chỉ chi tiết. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang quản lý địa chỉ.<br>2. Bước 1: Hệ thống hiển thị danh sách địa chỉ của người dùng.<br>3. Bước 2: Người dùng chọn thêm mới/chỉnh sửa/xóa địa chỉ hoặc đặt làm mặc định.<br>4. Bước 3: Hệ thống thực hiện thao tác và cập nhật database.<br>5. Bước 4: Hệ thống trả về danh sách địa chỉ đã cập nhật.<br>6. Kết thúc: Hiển thị thông báo thành công. |

### 2.6 Tìm kiếm sản phẩm

| Tên usecase | Tìm kiếm sản phẩm |
|-------------|-------------------|
| **Mục đích** | Cho phép người dùng tìm kiếm sản phẩm theo nhiều tiêu chí. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng có thể tìm kiếm sản phẩm theo tên, danh mục, khoảng giá, sắp xếp và phân trang. |
| **Các quy tắc nghiệp vụ** | - Chỉ hiển thị sản phẩm có trạng thái ACTIVE.<br>- Hỗ trợ tìm kiếm theo từ khóa (tên sản phẩm).<br>- Lọc theo danh mục, khoảng giá.<br>- Sắp xếp theo: giá tăng/giảm, mới nhất, bán chạy.<br>- Hỗ trợ phân trang. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang tìm kiếm/danh sách sản phẩm.<br>2. Bước 1: Hệ thống hiển thị giao diện tìm kiếm với các bộ lọc.<br>3. Bước 2: Người dùng nhập từ khóa, chọn bộ lọc và tiêu chí sắp xếp.<br>4. Bước 3: Hệ thống thực hiện tìm kiếm và trả về danh sách sản phẩm phân trang.<br>5. Kết thúc: Hiển thị kết quả tìm kiếm. |

### 2.7 Xem chi tiết sản phẩm

| Tên usecase | Xem chi tiết sản phẩm |
|-------------|-----------------------|
| **Mục đích** | Cho phép người dùng xem thông tin chi tiết của một sản phẩm. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng xem đầy đủ thông tin sản phẩm bao gồm: tên, mô tả, giá, hình ảnh, biến thể, đánh giá, thông tin cửa hàng. |
| **Các quy tắc nghiệp vụ** | - Hiển thị tất cả thông tin chi tiết của sản phẩm.<br>- Tự động tăng view count cho shop khi xem sản phẩm.<br>- Hiển thị các biến thể sản phẩm (size, màu sắc, số lượng tồn kho).<br>- Hiển thị đánh giá và rating trung bình.<br>- Hiển thị thông tin shop bán sản phẩm. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng click vào một sản phẩm từ danh sách.<br>2. Bước 1: Hệ thống lấy thông tin chi tiết sản phẩm.<br>3. Bước 2: Hệ thống tăng view count cho shop.<br>4. Bước 3: Hiển thị đầy đủ thông tin sản phẩm, biến thể, đánh giá.<br>5. Kết thúc: Người dùng có thể thêm vào giỏ hàng hoặc yêu thích. |

### 2.8 Quản lý giỏ hàng

| Tên usecase | Quản lý giỏ hàng |
|-------------|------------------|
| **Mục đích** | Cho phép người dùng quản lý các sản phẩm trong giỏ hàng trước khi đặt hàng. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng có thể thêm sản phẩm vào giỏ, xem giỏ hàng, cập nhật số lượng, xóa sản phẩm và xóa toàn bộ giỏ hàng. |
| **Các quy tắc nghiệp vụ** | - Mỗi user có một giỏ hàng duy nhất.<br>- Giỏ hàng chứa các cart items với product variant và số lượng.<br>- Số lượng không được vượt quá tồn kho.<br>- Tự động tính tổng tiền giỏ hàng.<br>- Nếu sản phẩm đã có trong giỏ, cập nhật số lượng thay vì tạo mới. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng thêm sản phẩm vào giỏ hoặc truy cập giỏ hàng.<br>2. Bước 1: Hệ thống lấy hoặc tạo giỏ hàng cho user.<br>3. Bước 2: Người dùng thực hiện các thao tác: thêm, sửa số lượng, xóa sản phẩm.<br>4. Bước 3: Hệ thống validate và cập nhật giỏ hàng.<br>5. Bước 4: Tính toán lại tổng tiền.<br>6. Kết thúc: Hiển thị giỏ hàng đã cập nhật. |

### 2.9 Quản lý danh sách yêu thích

| Tên usecase | Quản lý danh sách yêu thích |
|-------------|-----------------------------|
| **Mục đích** | Cho phép người dùng lưu các sản phẩm yêu thích để xem sau. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng có thể thêm sản phẩm vào danh sách yêu thích, xem danh sách, xóa sản phẩm và thêm ghi chú. |
| **Các quy tắc nghiệp vụ** | - Mỗi người dùng có một danh sách yêu thích riêng.<br>- Có thể thêm ghi chú cho từng sản phẩm yêu thích.<br>- Kiểm tra xem sản phẩm đã có trong wishlist hay chưa.<br>- Đếm số lượng sản phẩm trong wishlist.<br>- Hỗ trợ phân trang khi xem danh sách. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng thêm sản phẩm vào yêu thích hoặc truy cập danh sách.<br>2. Bước 1: Hệ thống kiểm tra sản phẩm đã tồn tại trong wishlist chưa.<br>3. Bước 2: Người dùng thực hiện thao tác thêm/xóa/cập nhật ghi chú.<br>4. Bước 3: Hệ thống cập nhật wishlist.<br>5. Kết thúc: Hiển thị danh sách yêu thích đã cập nhật. |

### 2.10 Đặt hàng

| Tên usecase | Đặt hàng |
|-------------|----------|
| **Mục đích** | Cho phép người dùng tạo đơn hàng từ giỏ hàng. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng chọn sản phẩm từ giỏ hàng, địa chỉ giao hàng, phương thức thanh toán và voucher để tạo đơn hàng. |
| **Các quy tắc nghiệp vụ** | - Phải có địa chỉ giao hàng hợp lệ.<br>- Kiểm tra tồn kho trước khi tạo đơn.<br>- Tính phí vận chuyển dựa trên địa chỉ.<br>- Áp dụng voucher nếu có (kiểm tra điều kiện và hạn sử dụng).<br>- Tạo payment record với trạng thái PENDING.<br>- Giảm số lượng tồn kho sau khi đặt hàng thành công.<br>- Tạo order tracking log. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng chọn sản phẩm trong giỏ hàng để đặt.<br>2. Bước 1: Hệ thống hiển thị trang thanh toán với địa chỉ, voucher.<br>3. Bước 2: Người dùng chọn địa chỉ, voucher và phương thức thanh toán.<br>4. Bước 3: Hệ thống validate, tính tổng tiền, phí ship, giảm giá.<br>5. Bước 4: Tạo đơn hàng với trạng thái PENDING.<br>6. Bước 5: Tạo payment record.<br>7. Kết thúc: Trả về thông tin đơn hàng đã tạo. |

### 2.11 Thanh toán

| Tên usecase | Thanh toán |
|-------------|------------|
| **Mục đích** | Cho phép người dùng thanh toán đơn hàng qua các phương thức khác nhau. |
| **Tác nhân** | Người dùng (User), VNPay System |
| **Mô tả** | Người dùng thực hiện thanh toán đơn hàng qua COD hoặc VNPay. Hệ thống xử lý và cập nhật trạng thái thanh toán. |
| **Các quy tắc nghiệp vụ** | - Hỗ trợ phương thức: COD, VNPay.<br>- Với VNPay, tạo payment URL và redirect user.<br>- Nhận callback từ VNPay để cập nhật trạng thái.<br>- Cập nhật trạng thái payment: PENDING → SUCCESS/FAILED.<br>- Khi thanh toán thành công, cập nhật trạng thái order.<br>- Tạo transaction ID duy nhất. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng chọn phương thức thanh toán sau khi đặt hàng.<br>2. Bước 1: Hệ thống tạo payment record với trạng thái PENDING.<br>3. Bước 2: Nếu VNPay, redirect đến cổng thanh toán VNPay.<br>4. Bước 3: Người dùng thực hiện thanh toán trên VNPay.<br>5. Bước 4: VNPay gửi callback về hệ thống.<br>6. Bước 5: Hệ thống cập nhật trạng thái payment và order.<br>7. Kết thúc: Thông báo kết quả thanh toán cho người dùng. |

### 2.12 Quản lý đơn hàng

| Tên usecase | Quản lý đơn hàng |
|-------------|------------------|
| **Mục đích** | Cho phép người dùng xem và theo dõi trạng thái đơn hàng của mình. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng xem danh sách đơn hàng, chi tiết đơn hàng, trạng thái vận chuyển và lịch sử thay đổi trạng thái. |
| **Các quy tắc nghiệp vụ** | - Người dùng chỉ xem được đơn hàng của mình.<br>- Hiển thị đầy đủ thông tin: sản phẩm, số lượng, giá, địa chỉ, trạng thái.<br>- Các trạng thái đơn hàng: PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED.<br>- Theo dõi lịch sử thay đổi trạng thái.<br>- Hiển thị thông tin vận chuyển và shipper (nếu có). |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng truy cập trang đơn hàng của tôi.<br>2. Bước 1: Hệ thống lấy danh sách đơn hàng của user.<br>3. Bước 2: Hiển thị danh sách đơn hàng với tóm tắt.<br>4. Bước 3: Người dùng chọn xem chi tiết đơn hàng.<br>5. Bước 4: Hiển thị đầy đủ thông tin đơn hàng, trạng thái, lịch sử.<br>6. Kết thúc: Người dùng có thể hủy đơn hoặc yêu cầu hoàn trả. |

### 2.13 Hủy đơn hàng

| Tên usecase | Hủy đơn hàng |
|-------------|--------------|
| **Mục đích** | Cho phép người dùng hủy đơn hàng chưa được xác nhận. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng có thể hủy đơn hàng với lý do và hệ thống cập nhật trạng thái, hoàn trả tồn kho. |
| **Các quy tắc nghiệp vụ** | - Chỉ hủy được đơn hàng ở trạng thái PENDING hoặc CONFIRMED.<br>- Phải cung cấp lý do hủy.<br>- Hoàn trả số lượng sản phẩm vào tồn kho.<br>- Cập nhật trạng thái đơn hàng thành CANCELLED.<br>- Tạo order tracking log ghi nhận hủy đơn.<br>- Nếu đã thanh toán online, tiến hành hoàn tiền. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng chọn đơn hàng cần hủy.<br>2. Bước 1: Hệ thống kiểm tra trạng thái đơn hàng.<br>3. Bước 2: Người dùng nhập lý do hủy đơn.<br>4. Bước 3: Hệ thống cập nhật trạng thái CANCELLED.<br>5. Bước 4: Hoàn trả tồn kho sản phẩm.<br>6. Bước 5: Tạo tracking log.<br>7. Kết thúc: Thông báo hủy đơn thành công. |

### 2.14 Yêu cầu hoàn trả

| Tên usecase | Yêu cầu hoàn trả |
|-------------|------------------|
| **Mục đích** | Cho phép người dùng gửi yêu cầu hoàn trả/đổi hàng cho đơn hàng đã nhận. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng tạo yêu cầu hoàn trả với lý do và hình ảnh minh chứng. Shop/Admin xem xét và xử lý. |
| **Các quy tắc nghiệp vụ** | - Chỉ tạo yêu cầu cho đơn hàng đã DELIVERED.<br>- Phải có lý do rõ ràng.<br>- Upload hình ảnh minh chứng (tối đa 5 ảnh).<br>- Trạng thái yêu cầu: PENDING → APPROVED/REJECTED.<br>- Shop hoặc Admin xử lý yêu cầu.<br>- Nếu được chấp nhận, tiến hành hoàn tiền hoặc đổi hàng. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng chọn đơn hàng cần hoàn trả.<br>2. Bước 1: Hệ thống kiểm tra điều kiện hoàn trả.<br>3. Bước 2: Người dùng nhập lý do và upload hình ảnh.<br>4. Bước 3: Hệ thống tạo return request với trạng thái PENDING.<br>5. Bước 4: Upload ảnh lên Cloudinary.<br>6. Kết thúc: Thông báo đã gửi yêu cầu, chờ xử lý. |

### 2.15 Đánh giá sản phẩm

| Tên usecase | Đánh giá sản phẩm |
|-------------|--------------------|
| **Mục đích** | Cho phép người dùng đánh giá và nhận xét về sản phẩm đã mua. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng viết đánh giá, cho điểm từ 1-5 sao, upload hình ảnh/video về sản phẩm đã mua. |
| **Các quy tắc nghiệp vụ** | - Chỉ đánh giá được sản phẩm đã mua (có order).<br>- Rating từ 1 đến 5 sao.<br>- Có thể upload ảnh và video (upload lên Cloudinary).<br>- Mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm.<br>- Tính rating trung bình cho sản phẩm.<br>- Hiển thị thống kê đánh giá theo số sao. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng chọn đánh giá sản phẩm từ đơn hàng đã nhận.<br>2. Bước 1: Hệ thống kiểm tra user đã mua sản phẩm chưa.<br>3. Bước 2: Người dùng chọn số sao, viết nhận xét, upload media.<br>4. Bước 3: Hệ thống upload media lên Cloudinary.<br>5. Bước 4: Tạo review record.<br>6. Bước 5: Cập nhật rating trung bình cho sản phẩm.<br>7. Kết thúc: Hiển thị đánh giá đã đăng. |

### 2.16 Sử dụng voucher

| Tên usecase | Sử dụng voucher |
|-------------|-----------------|
| **Mục đích** | Cho phép người dùng sử dụng mã giảm giá khi đặt hàng. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng nhập hoặc chọn voucher để áp dụng giảm giá cho đơn hàng. |
| **Các quy tắc nghiệp vụ** | - Kiểm tra voucher còn hiệu lực (startDate, endDate).<br>- Kiểm tra số lượng voucher còn lại.<br>- Kiểm tra giá trị đơn hàng tối thiểu (minOrderValue).<br>- Tính giảm giá theo discountType (PERCENTAGE hoặc FIXED_AMOUNT).<br>- Với PERCENTAGE, áp dụng maxDiscountAmount nếu có.<br>- Giảm usageCount sau khi áp dụng thành công.<br>- Lưu voucher đã sử dụng vào OrderVoucher. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng nhập mã voucher khi thanh toán.<br>2. Bước 1: Hệ thống kiểm tra mã voucher có tồn tại không.<br>3. Bước 2: Validate các điều kiện: thời hạn, số lượng, giá trị đơn tối thiểu.<br>4. Bước 3: Tính toán số tiền giảm giá.<br>5. Bước 4: Áp dụng voucher vào đơn hàng.<br>6. Bước 5: Giảm usageCount của voucher.<br>7. Kết thúc: Hiển thị tổng tiền sau giảm giá. |

### 2.17 Xem cửa hàng

| Tên usecase | Xem cửa hàng |
|-------------|--------------|
| **Mục đích** | Cho phép người dùng xem thông tin chi tiết và sản phẩm của cửa hàng. |
| **Tác nhân** | Người dùng (User) |
| **Mô tả** | Người dùng xem thông tin cửa hàng, danh sách sản phẩm của shop, số lượt xem và đánh giá. |
| **Các quy tắc nghiệp vụ** | - Hiển thị thông tin shop: tên, mô tả, logo, địa chỉ.<br>- Tự động tăng view count khi truy cập trang shop.<br>- Hiển thị danh sách sản phẩm của shop.<br>- Hiển thị số lượt xem shop.<br>- Hỗ trợ tìm kiếm và sắp xếp shop theo view count.<br>- Phân trang danh sách shop. |
| **Luồng Cơ bản** | 1. Mở đầu: Người dùng click vào tên shop hoặc tìm kiếm shop.<br>2. Bước 1: Hệ thống lấy thông tin chi tiết shop.<br>3. Bước 2: Tăng view count cho shop.<br>4. Bước 3: Lấy danh sách sản phẩm của shop.<br>5. Bước 4: Hiển thị thông tin shop và sản phẩm.<br>6. Kết thúc: Người dùng có thể xem và mua sản phẩm từ shop. |

---

## 3. API Endpoints tương ứng với Use Cases

### 3.1 Authentication & User Management
- **POST** `/api/auth/login` - Đăng nhập
- **POST** `/api/auth/register` - Đăng ký
- **POST** `/api/auth/google-login` - Đăng nhập Google
- **POST** `/api/auth/mobile/send-login-code` - Gửi mã đăng nhập mobile
- **POST** `/api/auth/mobile/verify-login-code` - Xác thực mã đăng nhập mobile
- **POST** `/api/auth/refresh-token` - Làm mới token
- **POST** `/api/auth/logout` - Đăng xuất
- **GET** `/api/user/profile` - Xem thông tin cá nhân
- **PUT** `/api/user/profile` - Cập nhật thông tin cá nhân
- **PUT** `/api/user/change-password` - Đổi mật khẩu

### 3.2 User Address Management
- **GET** `/api/addresses` - Lấy danh sách địa chỉ
- **GET** `/api/addresses/default` - Lấy địa chỉ mặc định
- **GET** `/api/addresses/{addressId}` - Xem chi tiết địa chỉ
- **POST** `/api/addresses` - Thêm địa chỉ mới
- **PUT** `/api/addresses/{addressId}` - Cập nhật địa chỉ
- **DELETE** `/api/addresses/{addressId}` - Xóa địa chỉ
- **PUT** `/api/addresses/{addressId}/set-default` - Đặt làm địa chỉ mặc định

### 3.3 Product Management
- **GET** `/api/products/search` - Tìm kiếm sản phẩm
- **GET** `/api/products/{id}` - Xem chi tiết sản phẩm
- **GET** `/api/products/all` - Lấy tất cả sản phẩm
- **GET** `/api/products/category/{categoryId}` - Lấy sản phẩm theo danh mục

### 3.4 Cart Management
- **GET** `/api/cart` - Xem giỏ hàng
- **POST** `/api/cart/add` - Thêm sản phẩm vào giỏ
- **PUT** `/api/cart/update` - Cập nhật số lượng sản phẩm
- **DELETE** `/api/cart/remove/{cartItemId}` - Xóa sản phẩm khỏi giỏ
- **DELETE** `/api/cart/clear` - Xóa toàn bộ giỏ hàng

### 3.5 Wishlist Management
- **POST** `/api/wishlist` - Thêm vào yêu thích
- **GET** `/api/wishlist` - Xem danh sách yêu thích
- **GET** `/api/wishlist/paged` - Xem danh sách yêu thích phân trang
- **DELETE** `/api/wishlist/{productId}` - Xóa khỏi yêu thích
- **DELETE** `/api/wishlist` - Xóa toàn bộ wishlist
- **GET** `/api/wishlist/check/{productId}` - Kiểm tra sản phẩm trong wishlist
- **GET** `/api/wishlist/count` - Đếm số lượng wishlist
- **PUT** `/api/wishlist/{productId}/note` - Cập nhật ghi chú

### 3.6 Order Management
- **POST** `/api/orders` - Tạo đơn hàng
- **GET** `/api/orders/{id}` - Xem chi tiết đơn hàng
- **GET** `/api/orders/user/{userId}` - Lấy đơn hàng của user
- **PUT** `/api/orders/status` - Cập nhật trạng thái đơn hàng
- **POST** `/api/orders/cancel` - Hủy đơn hàng
- **GET** `/api/orders` - Lấy tất cả đơn hàng với filter

### 3.7 Payment Management
- **POST** `/api/payments` - Tạo thanh toán
- **PUT** `/api/payments/{transactionId}/status` - Cập nhật trạng thái thanh toán
- **GET** `/api/payments/order/{orderId}` - Lấy thông tin thanh toán theo đơn hàng

### 3.8 Order Return Request
- **POST** `/api/orders/return-request` - Tạo yêu cầu hoàn trả
- **GET** `/api/orders/return-request/user/{userId}` - Lấy yêu cầu hoàn trả của user

### 3.9 Review Management
- **POST** `/api/reviews` - Tạo đánh giá
- **GET** `/api/reviews/product/{productId}` - Xem đánh giá theo sản phẩm
- **GET** `/api/reviews/{reviewId}` - Xem chi tiết đánh giá
- **DELETE** `/api/reviews/{reviewId}` - Xóa đánh giá
- **GET** `/api/reviews/product/{productId}/statistics` - Thống kê đánh giá
- **GET** `/api/reviews/user/{userId}/product/{productId}` - Kiểm tra đánh giá của user

### 3.10 Voucher Management
- **GET** `/api/vouchers` - Lấy tất cả voucher
- **GET** `/api/vouchers/{code}` - Lấy voucher theo mã

### 3.11 Shop Management
- **GET** `/api/shop/{id}` - Xem thông tin shop
- **GET** `/api/shop/all` - Lấy danh sách shop với phân trang và sắp xếp

---

## 4. Luồng nghiệp vụ chính

### 4.1 Luồng mua hàng hoàn chỉnh
```
Đăng nhập → Tìm kiếm sản phẩm → Xem chi tiết → Thêm vào giỏ 
→ Xem giỏ hàng → Chọn địa chỉ giao hàng → Áp dụng voucher 
→ Đặt hàng → Thanh toán → Theo dõi đơn hàng → Nhận hàng → Đánh giá
```

### 4.2 Luồng quản lý tài khoản
```
Đăng ký → Đăng nhập → Cập nhật thông tin cá nhân 
→ Quản lý địa chỉ → Đổi mật khẩu
```

### 4.3 Luồng hoàn trả
```
Nhận hàng → Phát hiện lỗi → Tạo yêu cầu hoàn trả 
→ Chờ duyệt → Hoàn tiền/Đổi hàng
```

---

**Ghi chú:** 
- Tất cả các API đều yêu cầu authentication qua JWT token (trừ login, register, google-login)
- Sử dụng role-based authorization với các role: USER, ADMIN, SHOP_OWNER, SHIPPER
- Upload file sử dụng Cloudinary service
- Payment gateway tích hợp VNPay
