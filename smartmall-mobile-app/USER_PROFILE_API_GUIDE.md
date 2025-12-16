# 👤 API User Profile - Hướng Dẫn Sử Dụng

## 📋 Mục Lục
1. [Lấy Thông Tin Profile](#1-lấy-thông-tin-profile)
2. [Cập Nhật Thông Tin Profile](#2-cập-nhật-thông-tin-profile)
3. [Đổi Mật Khẩu](#3-đổi-mật-khẩu)
4. [Lấy Profile Người Dùng Khác](#4-lấy-profile-người-dùng-khác)
5. [Cấu Trúc Dữ Liệu](#5-cấu-trúc-dữ-liệu)
6. [Code Mẫu](#6-code-mẫu)

---

## 🔐 Xác Thực (Authentication)

**Tất cả các API đều yêu cầu xác thực qua JWT Token**

### Header bắt buộc:
```
Authorization: Bearer {your_jwt_token}
```

---

## 1. Lấy Thông Tin Profile

### Endpoint
```
GET /api/user/profile
```

### Yêu cầu
- **Authentication**: Required (Bearer Token)
- **Roles**: USER hoặc ADMIN

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john.doe@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "avatar": "https://cloudinary.com/avatar123.jpg",
    "gender": "MALE",
    "dateOfBirth": "1990-01-15",
    "isActive": 1,
    "roles": ["USER"]
  }
}
```

### Ví dụ Request

**cURL:**
```bash
curl -X GET \
  http://localhost:8080/api/user/profile \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**JavaScript (Fetch):**
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

**Axios:**
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get('http://localhost:8080/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

---

## 2. Cập Nhật Thông Tin Profile

### Endpoint
```
PUT /api/user/profile
```

### Yêu cầu
- **Authentication**: Required (Bearer Token)
- **Roles**: USER hoặc ADMIN
- **Content-Type**: multipart/form-data

### Request Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `profileData` | JSON String | Có | Thông tin profile dạng JSON |
| `avatar` | File | Không | File ảnh đại diện (jpg, png, jpeg) |

### profileData JSON Structure

```json
{
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "gender": "MALE",
  "dateOfBirth": "1990-01-15"
}
```

### Giá trị Gender hợp lệ
- `MALE` - Nam
- `FEMALE` - Nữ
- `OTHER` - Khác

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john.doe@example.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "avatar": "https://cloudinary.com/new-avatar123.jpg",
    "gender": "MALE",
    "dateOfBirth": "1990-01-15",
    "isActive": 1,
    "roles": ["USER"]
  }
}
```

### Ví dụ Request

**Cập nhật cả thông tin và avatar:**

```javascript
const updateProfileWithAvatar = async (profileData, avatarFile) => {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  
  // Thêm profileData dạng JSON string
  formData.append('profileData', JSON.stringify(profileData));
  
  // Thêm avatar file (nếu có)
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await fetch('http://localhost:8080/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // Không cần set Content-Type, browser tự động set cho FormData
    },
    body: formData
  });
  
  return await response.json();
};

// Sử dụng
const profileData = {
  fullName: "Nguyễn Văn A",
  phoneNumber: "0901234567",
  gender: "MALE",
  dateOfBirth: "1990-01-15"
};

const fileInput = document.getElementById('avatar-input');
const avatarFile = fileInput.files[0];

updateProfileWithAvatar(profileData, avatarFile);
```

**Chỉ cập nhật thông tin (không đổi avatar):**

```javascript
const updateProfileOnly = async (profileData) => {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('profileData', JSON.stringify(profileData));
  
  const response = await fetch('http://localhost:8080/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};
```

**Chỉ cập nhật avatar:**

```javascript
const updateAvatarOnly = async (avatarFile) => {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  const response = await fetch('http://localhost:8080/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};
```

**React Component Example:**

```javascript
import { useState } from 'react';
import axios from 'axios';

function ProfileUpdate() {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    gender: 'MALE',
    dateOfBirth: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('profileData', JSON.stringify(profile));
      
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const response = await axios.put(
        'http://localhost:8080/api/user/profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Profile updated successfully!');
      console.log(response.data);
    } catch (error) {
      alert('Failed to update profile: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={profile.fullName}
        onChange={handleInputChange}
      />
      
      <input
        type="tel"
        name="phoneNumber"
        placeholder="Phone Number"
        value={profile.phoneNumber}
        onChange={handleInputChange}
      />
      
      <select name="gender" value={profile.gender} onChange={handleInputChange}>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
        <option value="OTHER">Other</option>
      </select>
      
      <input
        type="date"
        name="dateOfBirth"
        value={profile.dateOfBirth}
        onChange={handleInputChange}
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
```

---

## 3. Đổi Mật Khẩu

### Endpoint
```
PUT /api/user/change-password
```

### Yêu cầu
- **Authentication**: Required (Bearer Token)
- **Roles**: USER hoặc ADMIN
- **Content-Type**: application/json

### Request Body

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

### Validation Rules

| Field | Rule | Mô tả |
|-------|------|-------|
| `currentPassword` | Required | Mật khẩu hiện tại phải đúng |
| `newPassword` | Required, Min 6 chars | Mật khẩu mới (tối thiểu 6 ký tự) |
| `confirmPassword` | Required, Match newPassword | Xác nhận mật khẩu mới |

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": "Your password has been updated"
}
```

### Response Error (400 Bad Request)

**Mật khẩu hiện tại sai:**
```json
{
  "success": false,
  "message": "Failed to change password: Current password is incorrect",
  "data": null
}
```

**Mật khẩu mới không khớp:**
```json
{
  "success": false,
  "message": "Failed to change password: New password and confirm password do not match",
  "data": null
}
```

### Ví dụ Request

**JavaScript (Fetch):**
```javascript
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/user/change-password', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword
    })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data;
};

// Sử dụng
try {
  await changePassword('oldPassword123', 'newPassword456', 'newPassword456');
  alert('Password changed successfully!');
} catch (error) {
  alert(error.message);
}
```

**Axios:**
```javascript
const changePassword = async (passwords) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.put(
      'http://localhost:8080/api/user/change-password',
      passwords,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to change password';
  }
};

// Sử dụng
changePassword({
  currentPassword: 'oldPassword123',
  newPassword: 'newPassword456',
  confirmPassword: 'newPassword456'
})
.then(data => {
  console.log('Success:', data.message);
})
.catch(error => {
  console.error('Error:', error);
});
```

**React Hook Example:**

```javascript
import { useState } from 'react';
import axios from 'axios';

function ChangePasswordForm() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:8080/api/user/change-password',
        passwords,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(response.data.message);
      
      // Reset form
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
        value={passwords.currentPassword}
        onChange={handleChange}
        required
      />
      
      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={passwords.newPassword}
        onChange={handleChange}
        required
      />
      
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={passwords.confirmPassword}
        onChange={handleChange}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
}
```

---

## 4. Lấy Profile Người Dùng Khác

### Endpoint
```
GET /api/user/profile/{userId}
```

### Yêu cầu
- **Authentication**: Required (Bearer Token)
- **Roles**: USER hoặc ADMIN

### Path Parameters

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `userId` | UUID | ID của người dùng cần xem |

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "username": "jane.doe@example.com",
    "fullName": "Trần Thị B",
    "phoneNumber": "0907654321",
    "avatar": "https://cloudinary.com/avatar456.jpg",
    "gender": "FEMALE",
    "dateOfBirth": "1995-05-20",
    "isActive": 1,
    "roles": ["USER"]
  }
}
```

### Ví dụ Request

```javascript
const getUserProfile = async (userId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:8080/api/user/profile/${userId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return await response.json();
};

// Sử dụng
const userId = '456e7890-e89b-12d3-a456-426614174000';
getUserProfile(userId)
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---

## 5. Cấu Trúc Dữ Liệu

### UserInfoDto

```typescript
interface UserInfoDto {
  id: string;              // UUID
  username: string;        // Email hoặc username
  fullName: string | null; // Họ tên đầy đủ
  phoneNumber: string | null; // Số điện thoại
  avatar: string | null;   // URL ảnh đại diện
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null; // Giới tính
  dateOfBirth: string | null; // Ngày sinh (yyyy-MM-dd)
  isActive: number;        // 0: inactive, 1: active
  roles: string[];         // Danh sách vai trò
}
```

### UpdateUserProfileDto

```typescript
interface UpdateUserProfileDto {
  fullName: string;        // Họ tên đầy đủ
  phoneNumber: string;     // Số điện thoại
  gender: 'MALE' | 'FEMALE' | 'OTHER'; // Giới tính
  dateOfBirth: string;     // Ngày sinh (yyyy-MM-dd)
}
```

### ChangePasswordDto

```typescript
interface ChangePasswordDto {
  currentPassword: string; // Mật khẩu hiện tại
  newPassword: string;     // Mật khẩu mới
  confirmPassword: string; // Xác nhận mật khẩu mới
}
```

---

## 6. Code Mẫu

### Complete Profile Service (TypeScript)

```typescript
import axios, { AxiosInstance } from 'axios';

interface UserInfoDto {
  id: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dateOfBirth: string | null;
  isActive: number;
  roles: string[];
}

interface UpdateProfileDto {
  fullName: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class UserProfileService {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Tự động thêm token vào header
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Lấy thông tin profile của user hiện tại
   */
  async getMyProfile(): Promise<UserInfoDto> {
    const response = await this.api.get('/api/user/profile');
    return response.data.data;
  }

  /**
   * Lấy thông tin profile của user khác
   */
  async getUserProfile(userId: string): Promise<UserInfoDto> {
    const response = await this.api.get(`/api/user/profile/${userId}`);
    return response.data.data;
  }

  /**
   * Cập nhật profile (chỉ thông tin, không có avatar)
   */
  async updateProfile(profileData: UpdateProfileDto): Promise<UserInfoDto> {
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));

    const response = await this.api.put('/api/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }

  /**
   * Cập nhật profile với avatar
   */
  async updateProfileWithAvatar(
    profileData: UpdateProfileDto,
    avatarFile: File
  ): Promise<UserInfoDto> {
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));
    formData.append('avatar', avatarFile);

    const response = await this.api.put('/api/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }

  /**
   * Chỉ cập nhật avatar
   */
  async updateAvatar(avatarFile: File): Promise<UserInfoDto> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await this.api.put('/api/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(passwords: ChangePasswordDto): Promise<string> {
    const response = await this.api.put('/api/user/change-password', passwords);
    return response.data.data;
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();

// Sử dụng
export default UserProfileService;
```

### React Context Provider

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { userProfileService } from './UserProfileService';

interface UserContextType {
  user: UserInfoDto | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileDto, avatar?: File) => Promise<void>;
  changePassword: (passwords: ChangePasswordDto) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      const profile = await userProfileService.getMyProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileDto, avatar?: File) => {
    try {
      const updatedProfile = avatar
        ? await userProfileService.updateProfileWithAvatar(data, avatar)
        : await userProfileService.updateProfile(data);
      
      setUser(updatedProfile);
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwords: ChangePasswordDto) => {
    try {
      await userProfileService.changePassword(passwords);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshProfile, updateProfile, changePassword }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
```

---

## 🎯 Use Cases Thực Tế

### 1. Trang Profile - Hiển thị thông tin
```javascript
const profile = await userProfileService.getMyProfile();
console.log(profile);
```

### 2. Chỉnh sửa profile (cập nhật tên + SĐT)
```javascript
await userProfileService.updateProfile({
  fullName: 'Nguyễn Văn A',
  phoneNumber: '0901234567',
  gender: 'MALE',
  dateOfBirth: '1990-01-15'
});
```

### 3. Đổi avatar
```javascript
const fileInput = document.getElementById('avatar');
const file = fileInput.files[0];
await userProfileService.updateAvatar(file);
```

### 4. Đổi mật khẩu
```javascript
await userProfileService.changePassword({
  currentPassword: 'oldPass123',
  newPassword: 'newPass456',
  confirmPassword: 'newPass456'
});
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Authentication
- Tất cả API yêu cầu JWT token trong header
- Token phải hợp lệ và chưa hết hạn
- Nếu token hết hạn, redirect về trang login

### 2. File Upload (Avatar)
- Format hỗ trợ: JPG, JPEG, PNG
- Kích thước tối đa: Kiểm tra với backend (thường 5-10MB)
- File sẽ được upload lên Cloudinary

### 3. Validation
- Phone number: Format Việt Nam (10 số)
- Date of birth: Format yyyy-MM-dd
- Password: Tối thiểu 6 ký tự

### 4. Error Handling
```javascript
try {
  await userProfileService.updateProfile(data);
} catch (error) {
  if (error.response?.status === 401) {
    // Token hết hạn, redirect login
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    // Validation error
    alert(error.response.data.message);
  } else {
    // Server error
    alert('Something went wrong!');
  }
}
```

---

## 📝 Postman Collection

```json
{
  "info": {
    "name": "User Profile APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get My Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/user/profile"
      }
    },
    {
      "name": "Update Profile",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "profileData",
              "value": "{\"fullName\":\"Nguyễn Văn A\",\"phoneNumber\":\"0901234567\",\"gender\":\"MALE\",\"dateOfBirth\":\"1990-01-15\"}",
              "type": "text"
            },
            {
              "key": "avatar",
              "type": "file",
              "src": "/path/to/avatar.jpg"
            }
          ]
        },
        "url": "{{baseUrl}}/api/user/profile"
      }
    },
    {
      "name": "Change Password",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"currentPassword\": \"oldPassword123\",\n  \"newPassword\": \"newPassword456\",\n  \"confirmPassword\": \"newPassword456\"\n}"
        },
        "url": "{{baseUrl}}/api/user/change-password"
      }
    },
    {
      "name": "Get User Profile By ID",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/user/profile/{{userId}}"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": "your_jwt_token_here"
    },
    {
      "key": "userId",
      "value": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

---

**Tài liệu được tạo bởi: Smart Mall Spring Boot Team**  
**Ngày cập nhật: 16/12/2025**
