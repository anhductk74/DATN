# API Profile Examples - Smart Mall

Tài liệu này cung cấp các ví dụ API profile để test và sử dụng trong mobile app.

## 1. Lấy thông tin Profile của User hiện tại

**Endpoint**: `GET /api/users/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "avatar": "https://cloudinary.com/images/avatar123.jpg",
    "isActive": 1,
    "roles": ["USER"],
    "addresses": [
      {
        "id": "address-uuid-1",
        "recipientName": "Nguyễn Văn A",
        "recipientPhone": "0123456789",
        "street": "123 Đường Lê Lợi",
        "ward": "Phường Bến Nghé",
        "district": "Quận 1",
        "city": "Hồ Chí Minh",
        "isDefault": true
      },
      {
        "id": "address-uuid-2",
        "recipientName": "Nguyễn Văn A",
        "recipientPhone": "0987654321",
        "street": "456 Đường Nguyễn Huệ",
        "ward": "Phường Bến Thành",
        "district": "Quận 1",
        "city": "Hồ Chí Minh",
        "isDefault": false
      }
    ]
  }
}
```

**Response Error (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token",
  "data": null
}
```

---

## 2. Cập nhật Profile

**Endpoint**: `PUT /api/users/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321"
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0987654321",
    "avatar": "https://cloudinary.com/images/avatar123.jpg",
    "isActive": 1,
    "roles": ["USER"]
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "fullName": "Full name must not be empty",
    "phoneNumber": "Phone number must be valid"
  }
}
```

---

## 3. Upload Avatar

**Endpoint**: `POST /api/users/profile/avatar`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
```
file: [binary image data]
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://res.cloudinary.com/smartmall/image/upload/v1234567890/avatars/user123.jpg"
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid file format. Only JPG, PNG, JPEG are allowed",
  "data": null
}
```

---

## 4. Thêm địa chỉ mới

**Endpoint**: `POST /api/users/addresses`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0123456789",
  "street": "789 Đường Võ Văn Tần",
  "ward": "Phường Võ Thị Sáu",
  "district": "Quận 3",
  "city": "Hồ Chí Minh",
  "isDefault": false
}
```

**Response Success (201 Created)**:
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "id": "address-uuid-3",
    "recipientName": "Nguyễn Văn A",
    "recipientPhone": "0123456789",
    "street": "789 Đường Võ Văn Tần",
    "ward": "Phường Võ Thị Sáu",
    "district": "Quận 3",
    "city": "Hồ Chí Minh",
    "isDefault": false
  }
}
```

---

## 5. Cập nhật địa chỉ

**Endpoint**: `PUT /api/users/addresses/{addressId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Path Parameters**:
- `addressId`: UUID của địa chỉ cần cập nhật

**Request Body**:
```json
{
  "recipientName": "Nguyễn Thị B",
  "recipientPhone": "0987654321",
  "street": "789 Đường Võ Văn Tần - Tầng 2",
  "ward": "Phường Võ Thị Sáu",
  "district": "Quận 3",
  "city": "Hồ Chí Minh",
  "isDefault": true
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": "address-uuid-3",
    "recipientName": "Nguyễn Thị B",
    "recipientPhone": "0987654321",
    "street": "789 Đường Võ Văn Tần - Tầng 2",
    "ward": "Phường Võ Thị Sáu",
    "district": "Quận 3",
    "city": "Hồ Chí Minh",
    "isDefault": true
  }
}
```

**Response Error (404 Not Found)**:
```json
{
  "success": false,
  "message": "Address not found",
  "data": null
}
```

---

## 6. Xóa địa chỉ

**Endpoint**: `DELETE /api/users/addresses/{addressId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters**:
- `addressId`: UUID của địa chỉ cần xóa

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "data": null
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Cannot delete default address. Please set another address as default first",
  "data": null
}
```

---

## 7. Đặt địa chỉ làm mặc định

**Endpoint**: `PUT /api/users/addresses/{addressId}/set-default`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Path Parameters**:
- `addressId`: UUID của địa chỉ cần đặt làm mặc định

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Default address updated successfully",
  "data": {
    "id": "address-uuid-3",
    "recipientName": "Nguyễn Văn A",
    "recipientPhone": "0123456789",
    "street": "789 Đường Võ Văn Tần",
    "ward": "Phường Võ Thị Sáu",
    "district": "Quận 3",
    "city": "Hồ Chí Minh",
    "isDefault": true
  }
}
```

---

## 8. Lấy danh sách địa chỉ

**Endpoint**: `GET /api/users/addresses`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "id": "address-uuid-1",
      "recipientName": "Nguyễn Văn A",
      "recipientPhone": "0123456789",
      "street": "123 Đường Lê Lợi",
      "ward": "Phường Bến Nghé",
      "district": "Quận 1",
      "city": "Hồ Chí Minh",
      "isDefault": true
    },
    {
      "id": "address-uuid-2",
      "recipientName": "Nguyễn Văn A",
      "recipientPhone": "0987654321",
      "street": "456 Đường Nguyễn Huệ",
      "ward": "Phường Bến Thành",
      "district": "Quận 1",
      "city": "Hồ Chí Minh",
      "isDefault": false
    }
  ]
}
```

---

## 9. Đổi mật khẩu

**Endpoint**: `PUT /api/users/change-password`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "data": null
}
```

---

## Testing với cURL

### 1. Lấy profile
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Cập nhật profile
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0987654321"
  }'
```

### 3. Upload avatar
```bash
curl -X POST http://localhost:8080/api/users/profile/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.jpg"
```

### 4. Thêm địa chỉ
```bash
curl -X POST http://localhost:8080/api/users/addresses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Nguyễn Văn A",
    "recipientPhone": "0123456789",
    "street": "789 Đường Võ Văn Tần",
    "ward": "Phường Võ Thị Sáu",
    "district": "Quận 3",
    "city": "Hồ Chí Minh",
    "isDefault": false
  }'
```

### 5. Đổi mật khẩu
```bash
curl -X PUT http://localhost:8080/api/users/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword456",
    "confirmPassword": "NewPassword456"
  }'
```

---

## Testing với Postman

### Setup Environment
1. Tạo environment mới: "Smart Mall - Local"
2. Thêm biến:
   - `BASE_URL`: http://localhost:8080
   - `ACCESS_TOKEN`: (lấy từ login response)

### Collection Tests

**1. Login và lưu token:**
```javascript
// Test Script cho Login request
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has accessToken", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.accessToken).to.be.a('string');
    pm.environment.set("ACCESS_TOKEN", jsonData.data.accessToken);
});
```

**2. Request profile với token:**
```
GET {{BASE_URL}}/api/users/profile
Authorization: Bearer {{ACCESS_TOKEN}}
```

**3. Test update profile:**
```javascript
pm.test("Profile updated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.fullName).to.eql("Nguyễn Văn B");
});
```

---

## React Native Example

### Lấy profile
```javascript
const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8080/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      setUserProfile(data.data);
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};
```

### Cập nhật profile
```javascript
const updateProfile = async (fullName, phoneNumber) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8080/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fullName, phoneNumber })
    });
    
    const data = await response.json();
    if (data.success) {
      Alert.alert('Success', 'Profile updated successfully');
      setUserProfile(data.data);
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

### Upload avatar
```javascript
const uploadAvatar = async (imageUri) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg'
    });
    
    const response = await fetch('http://localhost:8080/api/users/profile/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      Alert.alert('Success', 'Avatar uploaded successfully');
      setAvatarUrl(data.data.avatarUrl);
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
  }
};
```

### Thêm địa chỉ
```javascript
const addAddress = async (addressData) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8080/api/users/addresses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });
    
    const data = await response.json();
    if (data.success) {
      Alert.alert('Success', 'Address added successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Error adding address:', error);
  }
};
```

---

## Common Error Codes

| Status Code | Message | Giải thích |
|------------|---------|------------|
| 200 | Success | Request thành công |
| 201 | Created | Tạo mới thành công |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Không tìm thấy tài nguyên |
| 500 | Internal Server Error | Lỗi server |

---

## Validation Rules

### Profile
- `fullName`: Bắt buộc, ít nhất 2 ký tự
- `phoneNumber`: Bắt buộc, đúng format số điện thoại Việt Nam (10-11 số)

### Address
- `recipientName`: Bắt buộc, ít nhất 2 ký tự
- `recipientPhone`: Bắt buộc, đúng format số điện thoại
- `street`: Bắt buộc
- `ward`: Bắt buộc
- `district`: Bắt buộc
- `city`: Bắt buộc
- `isDefault`: Boolean

### Password
- `currentPassword`: Bắt buộc
- `newPassword`: Bắt buộc, ít nhất 8 ký tự, có chữ hoa, chữ thường và số
- `confirmPassword`: Bắt buộc, phải khớp với newPassword

### Avatar
- Định dạng cho phép: JPG, JPEG, PNG
- Kích thước tối đa: 10MB
- Kích thước khuyến nghị: 500x500px

---

## Notes

1. **Authentication**: Tất cả API profile đều yêu cầu JWT token trong header Authorization
2. **Token Expiry**: Access token hết hạn sau 24h, sử dụng refresh token để lấy token mới
3. **Default Address**: Mỗi user chỉ có 1 địa chỉ mặc định, khi set địa chỉ mới làm default thì địa chỉ cũ sẽ tự động bỏ default
4. **Avatar**: Ảnh được upload lên Cloudinary và trả về URL
5. **Phone Format**: Số điện thoại Việt Nam: 0XXXXXXXXX (10-11 số)
