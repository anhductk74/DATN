# User Profile API - Mẫu JSON cho Postman (Updated with Gender & Date of Birth)

## 👤 **USER PROFILE APIs**

### 1. **Get Current User Profile** - `GET /api/user/profile`
**Authorization:** `Bea### 🔗 **Simplified API:**
- ✅ **Single Endpoint**: Chỉ 1 endpoint `PUT /api/user/profile` cho mọi update
- ✅ **Form-Data Only**: Chỉ sử dụng multipart/form-data (đơn giản)
- ✅ **Avatar Optional**: Tự động kiểm tra có avatar hay không
- ✅ **Consistent Format**: Luôn dùng form-data, không cần phân biệtaccess_token}`

**URL:** `http://localhost:8080/api/user/profile`

### 2. **Update Profile (Form-Data Only)** - `PUT /api/user/profile` ⭐ **SIMPLIFIED**
**Authorization:** `Bearer {access_token}`
**Content-Type:** `multipart/form-data`

**Form-data (Avatar Optional):**
```
Key: profileData (Text) [Required]
Value: {
  "fullName": "Nguyễn Văn An Updated",
  "phoneNumber": "0987654321",
  "gender": "MALE",
  "dateOfBirth": "1990-01-15"
}

Key: avatar (File) [Optional]
Value: [Chọn file ảnh avatar mới - có thể bỏ trống]
```

**📝 Note:** 
- **profileData**: Luôn bắt buộc (JSON string)
- **avatar**: Optional - có thể có hoặc không
- API tự động kiểm tra avatar và xử lý accordingly

### 3. **Change Password** - `PUT /api/user/change-password` ⭐ **NEW**
**Authorization:** `Bearer {access_token}`
**Content-Type:** `application/json`

**JSON Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

**📝 Note:**
- **currentPassword**: Không bắt buộc với Google OAuth users
- **newPassword**: Tối thiểu 6 ký tự
- **confirmPassword**: Phải trùng với newPassword

### 4. **Get User Profile by ID (Admin Only)** - `GET /api/user/profile/{userId}`
**Authorization:** `Bearer {admin_access_token}`

**URL:** `http://localhost:8080/api/user/profile/550e8400-e29b-41d4-a716-446655440000`

### 5. **Admin Only Test** - `GET /api/user/admin`
**Authorization:** `Bearer {admin_access_token}`

**URL:** `http://localhost:8080/api/user/admin`

---

## 🔄 **Response Examples**

### ✅ **Success Response - Get Profile:**
```json
{
  "status": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "fullName": "Nguyễn Văn An",
    "phoneNumber": "0901234567",
    "avatar": "/demo/image/upload/v1234567890/avatar/abc123.jpg",
    "gender": "MALE",
    "dateOfBirth": "1990-01-15",
    "isActive": 1,
    "roles": ["USER"]
  },
  "message": "User profile retrieved successfully"
}
```

### ✅ **Success Response - Update Profile:**
```json
{
  "status": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "fullName": "Nguyễn Văn An Updated",
    "phoneNumber": "0987654321",
    "avatar": "/demo/image/upload/v1234567890/avatar/new_avatar.jpg",
    "gender": "FEMALE",
    "dateOfBirth": "1992-03-20",
    "isActive": 1,
    "roles": ["USER"]
  },
  "message": "Profile updated successfully"
}
```

### ❌ **Error Response - Unauthorized:**
```json
{
  "status": 401,
  "data": null,
  "message": "Access Denied"
}
```

### ✅ **Success Response - Change Password:**
```json
{
  "status": 200,
  "data": "Your password has been updated",
  "message": "Password changed successfully"
}
```

### ❌ **Error Response - Password Validation:**
```json
{
  "status": 400, 
  "data": null,
  "message": "Failed to change password: New password must be at least 6 characters long"
}
```

### ❌ **Error Response - Current Password Wrong:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to change password: Current password is incorrect"
}
```

### ❌ **Error Response - Invalid Gender:**
```json
{
  "status": 400,
  "data": null,
  "message": "Failed to update profile: Invalid gender value. Valid values are: MALE, FEMALE, OTHER"
}
```

---

## 📋 **Field Information:**

### 🔹 **Gender Field:**
- **Type**: Enum
- **Valid Values**: `"MALE"`, `"FEMALE"`, `"OTHER"`
- **Optional**: Yes (có thể bỏ trống hoặc null)
- **Example**: `"gender": "MALE"`

### 📅 **Date of Birth Field:**
- **Type**: String
- **Format**: `YYYY-MM-DD` (ISO 8601 date format)
- **Optional**: Yes (có thể bỏ trống hoặc null)
- **Example**: `"dateOfBirth": "1990-01-15"`
- **Validation**: Must be valid date format

---

## 📋 **Test Flow Recommendations:**

### **Complete Profile Update Testing Flow:**

1. **Authentication:**
   - Login with user credentials → Get access_token
   - Login with admin credentials → Get admin_access_token

2. **Get Current Profile:**
   - GET `/api/user/profile` with Bearer token
   - Verify user information returned with new fields

3. **Update Profile (All Fields, No Avatar):**
   **PUT** `/api/user/profile` with **Content-Type: multipart/form-data**
   ```
   profileData: {
     "fullName": "Nguyễn Thị Lan",
     "phoneNumber": "0987654321", 
     "gender": "FEMALE",
     "dateOfBirth": "1995-06-10"
   }
   ```

4. **Update Profile (Partial Fields, No Avatar):**
   **PUT** `/api/user/profile` with **Content-Type: multipart/form-data**
   ```
   profileData: {
     "fullName": "Trần Văn Nam",
     "gender": "MALE"
   }
   ```

5. **Update Profile WITH Avatar:**
   **PUT** `/api/user/profile` with **Content-Type: multipart/form-data**
   ```
   profileData: {
     "fullName": "Lê Thị Hoa",
     "phoneNumber": "0912345678",
     "gender": "FEMALE",
     "dateOfBirth": "1988-12-25"
   }
   avatar: [select image file]
   ```

6. **Update Only Avatar (Keep Other Fields):**
   **PUT** `/api/user/profile` with **Content-Type: multipart/form-data**
   ```
   profileData: {}
   avatar: [select new image file]
   ```

7. **Change Password (Normal User):**
   **PUT** `/api/user/change-password` with **Content-Type: application/json**
   ```json
   {
     "currentPassword": "oldPassword123",
     "newPassword": "newSecurePassword456", 
     "confirmPassword": "newSecurePassword456"
   }
   ```

8. **Change Password (Google OAuth User):**
   **PUT** `/api/user/change-password` with **Content-Type: application/json**
   ```json
   {
     "newPassword": "newSecurePassword456",
     "confirmPassword": "newSecurePassword456"
   }
   ```
   (không cần currentPassword cho Google users)

9. **Test Invalid Password:**
   ```json
   {
     "gender": "INVALID_VALUE"
   }
   ```
   → Should return 400 error

7. **Test Invalid Date Format:**
   ```json
   {
     "dateOfBirth": "25/12/1988"
   }
   ```
   → Should return 400 error

### **Environment Variables for Postman:**
```
base_url = http://localhost:8080
user_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
admin_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user_id = 550e8400-e29b-41d4-a716-446655440000
```

---

## 🎯 **Key Features Updated:**

### � **Unified API:**
- ✅ **Single Endpoint**: Chỉ 1 endpoint `PUT /api/user/profile` cho mọi update
- ✅ **Dual Content-Type**: Support cả JSON và multipart form-data
- ✅ **Smart Detection**: Tự động phát hiện request type
- ✅ **Simplified Usage**: Không cần nhớ 2 endpoints khác nhau

### �👥 **Gender Support:**
- ✅ **Enum Validation**: Chỉ accept MALE, FEMALE, OTHER
- ✅ **Optional Field**: Có thể để null hoặc không gửi
- ✅ **Case Sensitive**: Phải viết hoa chính xác

### 📅 **Date of Birth Support:**
- ✅ **ISO 8601 Format**: yyyy-MM-dd format chuẩn
- ✅ **String Storage**: Lưu dưới dạng string trong DB
- ✅ **Optional Field**: Có thể để null hoặc không gửi
- ✅ **Flexible Input**: Accept bất kỳ date valid nào

### � **Password Security:**
- ✅ **Current Password Validation**: Xác thực mật khẩu hiện tại
- ✅ **Google OAuth Support**: Không cần current password cho Google users
- ✅ **Password Strength**: Tối thiểu 6 ký tự
- ✅ **Confirm Password**: Đảm bảo nhập đúng 2 lần

### �🔄 **Flexible Updates:**
- ✅ **Mix & Match**: Có thể update bất kỳ combination nào
- ✅ **Null Safety**: Không overwrite nếu field không được gửi
- ✅ **Avatar Optional**: Có thể có hoặc không có avatar
- ✅ **Simple Logic**: Luôn dùng form-data, logic xử lý đơn giản

---

## 🚀 **Use Cases thực tế:**

### **Scenario 1: Complete Profile Setup**
```json
{
  "fullName": "Nguyễn Văn Long",
  "phoneNumber": "0901234567",
  "gender": "MALE",
  "dateOfBirth": "1990-01-15"
}
```

### **Scenario 2: Gender Update Only**
```json
{
  "gender": "OTHER"
}
```

### **Scenario 3: Birthday Update**
```json
{
  "dateOfBirth": "1985-07-20"
}
```

### **Scenario 4: Profile with Avatar (Unified API)**
**PUT** `/api/user/profile` with **Content-Type: multipart/form-data**
```
Form Data:
profileData: {"fullName":"Trần Thị Mai","gender":"FEMALE","dateOfBirth":"1992-03-10"}
avatar: profile_photo.jpg
```

### **Scenario 5: Only Name Update (Form-Data)**
**PUT** `/api/user/profile` with **Content-Type: multipart/form-data**
```
Form Data:
profileData: {"fullName":"Lê Văn Minh"}
```

### **Scenario 6: Change Password (Regular User)**
**PUT** `/api/user/change-password` with **Content-Type: application/json**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

### **Scenario 7: Change Password (Google OAuth User)**
**PUT** `/api/user/change-password` with **Content-Type: application/json**
```json
{
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

---

## 🔧 **Technical Notes:**

### **Gender Enum Values:**
```java
public enum Gender {
    MALE,
    FEMALE, 
    OTHER
}
```

### **Date Format Examples:**
- ✅ **Valid**: `"1990-01-15"`, `"2000-12-31"`, `"1985-07-04"`
- ❌ **Invalid**: `"15/01/1990"`, `"1990-1-15"`, `"01-15-1990"`

### **JSON Examples for Different Scenarios:**

#### **Minimal Update:**
```json
{
  "fullName": "New Name Only"
}
```

#### **Gender & DOB Only:**
```json
{
  "gender": "FEMALE",
  "dateOfBirth": "1995-06-15"
}
```

#### **Full Profile:**
```json
{
  "fullName": "Nguyễn Thị Lan Anh",
  "phoneNumber": "0987123456",
  "gender": "FEMALE", 
  "dateOfBirth": "1990-08-25"
}
```

User Profile API đã được cập nhật với Gender, Date of Birth và Change Password! 🎯✨