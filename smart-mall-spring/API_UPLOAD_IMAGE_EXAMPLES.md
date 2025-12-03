# API Upload Image Examples - Smart Mall

Tài liệu hướng dẫn sử dụng API upload ảnh lên Cloudinary cho mobile app và web.

## Tổng quan

API upload ảnh sử dụng Cloudinary để lưu trữ và quản lý hình ảnh. Tất cả ảnh được upload sẽ được lưu trên cloud và trả về URL để sử dụng.

### Giới hạn upload:
- **Kích thước tối đa**: 10MB/file
- **Số file tối đa**: 10 files/request (upload nhiều ảnh)
- **Định dạng cho phép**: JPG, JPEG, PNG, GIF, WEBP
- **Loại file**: Chỉ chấp nhận file ảnh (image/*)

---

## 1. Upload một ảnh đơn lẻ

**Endpoint**: `POST /api/upload-image`

**Headers**:
```
Content-Type: multipart/form-data
```

**Form Data**:
- `file`: File ảnh (required)

**Request Example** (cURL):
```bash
curl -X POST http://localhost:8080/api/upload-image \
  -F "file=@/path/to/image.jpg"
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/smartmall/image/abc123xyz.jpg",
    "publicId": "image/abc123xyz"
  }
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "File size must not exceed 10MB",
  "data": null
}
```

**Các lỗi có thể xảy ra:**
- "File is empty"
- "Only image files are allowed"
- "File size must not exceed 10MB"
- "Failed to upload image: [error details]"

---

## 2. Upload nhiều ảnh cùng lúc

**Endpoint**: `POST /api/upload-image/multiple`

**Headers**:
```
Content-Type: multipart/form-data
```

**Form Data**:
- `files`: Array of files (required, max 10 files)

**Request Example** (cURL):
```bash
curl -X POST http://localhost:8080/api/upload-image/multiple \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "files=@/path/to/image3.jpg"
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": [
    {
      "url": "/smartmall/image/abc123xyz.jpg",
      "publicId": "image/abc123xyz"
    },
    {
      "url": "/smartmall/image/def456uvw.jpg",
      "publicId": "image/def456uvw"
    },
    {
      "url": "/smartmall/image/ghi789rst.jpg",
      "publicId": "image/ghi789rst"
    }
  ]
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Maximum 10 files allowed",
  "data": null
}
```

**Các lỗi có thể xảy ra:**
- "No files provided"
- "Maximum 10 files allowed"
- "File [filename] is not an image"
- "File [filename] exceeds 10MB"

---

## 3. Upload ảnh vào folder cụ thể

**Endpoint**: `POST /api/upload-image/folder/{folderName}`

**Headers**:
```
Content-Type: multipart/form-data
```

**Path Parameters**:
- `folderName`: Tên folder muốn lưu ảnh (ví dụ: products, avatars, reviews)

**Form Data**:
- `file`: File ảnh (required)

**Request Example** (cURL):
```bash
curl -X POST http://localhost:8080/api/upload-image/folder/products \
  -F "file=@/path/to/product.jpg"
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/smartmall/products/product123.jpg",
    "publicId": "products/product123"
  }
}
```

**Folder suggestions:**
- `avatars`: Ảnh đại diện user
- `products`: Ảnh sản phẩm
- `shops`: Ảnh shop/cửa hàng
- `reviews`: Ảnh đánh giá sản phẩm
- `categories`: Ảnh danh mục
- `banners`: Ảnh banner quảng cáo

---

## 4. Xóa ảnh

**Endpoint**: `DELETE /api/upload-image/{publicId}`

**Path Parameters**:
- `publicId`: Public ID của ảnh (lấy từ response khi upload)

**Note**: Nếu publicId có dấu `/` (ví dụ: `products/product123`), cần encode thành `products%2Fproduct123`

**Request Example** (cURL):
```bash
curl -X DELETE "http://localhost:8080/api/upload-image/image%2Fabc123xyz"
```

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": null
}
```

**Response Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Failed to delete image: [error details]",
  "data": null
}
```

---

## 5. Lấy thông tin giới hạn upload

**Endpoint**: `GET /api/upload-image/limits`

**Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Upload limits retrieved successfully",
  "data": {
    "maxFileSize": "10MB",
    "maxFileSizeBytes": 10485760,
    "maxFiles": 10,
    "allowedTypes": [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp"
    ],
    "allowedExtensions": [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp"
    ]
  }
}
```

---

## React Native Examples

### 1. Upload một ảnh từ Image Picker

```javascript
import { launchImageLibrary } from 'react-native-image-picker';

const uploadSingleImage = async () => {
  try {
    // Chọn ảnh
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel) return;

    const image = result.assets[0];

    // Tạo FormData
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'image.jpg',
    });

    // Upload
    const response = await fetch('http://localhost:8080/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Image URL:', data.data.url);
      console.log('Public ID:', data.data.publicId);
      setImageUrl(data.data.url);
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
};
```

### 2. Upload nhiều ảnh

```javascript
const uploadMultipleImages = async (images) => {
  try {
    const formData = new FormData();

    // Thêm từng ảnh vào FormData
    images.forEach((image, index) => {
      formData.append('files', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `image${index}.jpg`,
      });
    });

    const response = await fetch('http://localhost:8080/api/upload-image/multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Uploaded URLs:', data.data);
      const urls = data.data.map(item => item.url);
      setImageUrls(urls);
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    Alert.alert('Error', 'Failed to upload images');
  }
};
```

### 3. Upload ảnh vào folder cụ thể

```javascript
const uploadToFolder = async (imageUri, folderName) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    const response = await fetch(
      `http://localhost:8080/api/upload-image/folder/${folderName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Sử dụng
const avatarUrl = await uploadToFolder(imageUri, 'avatars');
const productImageUrl = await uploadToFolder(imageUri, 'products');
```

### 4. Upload với progress indicator

```javascript
const uploadWithProgress = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress event
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
          console.log(`Upload progress: ${Math.round(progress)}%`);
        }
      });

      // Load event
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.response);
          if (data.success) {
            resolve(data.data.url);
          } else {
            reject(new Error(data.message));
          }
        } else {
          reject(new Error('Upload failed'));
        }
      });

      // Error event
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', 'http://localhost:8080/api/upload-image');
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

### 5. Xóa ảnh

```javascript
const deleteImage = async (publicId) => {
  try {
    // Encode publicId nếu có dấu /
    const encodedPublicId = encodeURIComponent(publicId);

    const response = await fetch(
      `http://localhost:8080/api/upload-image/${encodedPublicId}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();
    
    if (data.success) {
      Alert.alert('Success', 'Image deleted successfully');
    } else {
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Delete error:', error);
    Alert.alert('Error', 'Failed to delete image');
  }
};
```

### 6. Component upload avatar hoàn chỉnh

```javascript
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const AvatarUpload = ({ currentAvatar, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);

  const selectAndUploadImage = async () => {
    try {
      // Chọn ảnh
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (result.didCancel) return;

      const image = result.assets[0];

      // Validate kích thước
      if (image.fileSize > 10 * 1024 * 1024) {
        Alert.alert('Error', 'File size must not exceed 10MB');
        return;
      }

      setUploading(true);

      // Upload
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'avatar.jpg',
      });

      const response = await fetch(
        'http://localhost:8080/api/upload-image/folder/avatars',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setAvatarUrl(data.data.url);
        onUploadSuccess(data.data.url, data.data.publicId);
        Alert.alert('Success', 'Avatar uploaded successfully');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity onPress={selectAndUploadImage} disabled={uploading}>
      <View style={{ width: 100, height: 100, borderRadius: 50, overflow: 'hidden' }}>
        {uploading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <Image
            source={{ uri: avatarUrl || 'https://via.placeholder.com/100' }}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AvatarUpload;
```

---

## Testing với Postman

### 1. Upload một ảnh

**Request:**
- Method: POST
- URL: `http://localhost:8080/api/upload-image`
- Body: form-data
  - Key: `file` (type: File)
  - Value: Chọn file ảnh

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has image URL", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.url).to.be.a('string');
    pm.expect(jsonData.data.publicId).to.be.a('string');
    
    // Lưu URL và publicId để dùng cho test khác
    pm.environment.set("IMAGE_URL", jsonData.data.url);
    pm.environment.set("IMAGE_PUBLIC_ID", jsonData.data.publicId);
});
```

### 2. Upload nhiều ảnh

**Request:**
- Method: POST
- URL: `http://localhost:8080/api/upload-image/multiple`
- Body: form-data
  - Key: `files` (type: File) - Chọn nhiều file
  - Key: `files` (type: File) - Thêm file thứ 2
  - Key: `files` (type: File) - Thêm file thứ 3

---

## Best Practices

### 1. Resize ảnh trước khi upload (Mobile)
```javascript
import ImageResizer from 'react-native-image-resizer';

const resizeAndUpload = async (imageUri) => {
  try {
    // Resize ảnh trước khi upload
    const resized = await ImageResizer.createResizedImage(
      imageUri,
      1024,  // max width
      1024,  // max height
      'JPEG',
      80,    // quality
    );

    // Upload ảnh đã resize
    const formData = new FormData();
    formData.append('file', {
      uri: resized.uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    // ... upload code
  } catch (error) {
    console.error('Resize error:', error);
  }
};
```

### 2. Validate trước khi upload
```javascript
const validateImage = (image) => {
  // Check file size
  if (image.fileSize > 10 * 1024 * 1024) {
    throw new Error('File size must not exceed 10MB');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(image.type)) {
    throw new Error('Only JPG, PNG, GIF, WEBP are allowed');
  }

  return true;
};
```

### 3. Cache ảnh đã upload
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheUploadedImage = async (localUri, cloudUrl) => {
  try {
    const cache = await AsyncStorage.getItem('uploaded_images') || '{}';
    const parsed = JSON.parse(cache);
    parsed[localUri] = cloudUrl;
    await AsyncStorage.setItem('uploaded_images', JSON.stringify(parsed));
  } catch (error) {
    console.error('Cache error:', error);
  }
};
```

---

## Notes

1. **URL Format**: URL trả về là relative path, cần thêm Cloudinary base URL khi hiển thị
2. **Public ID**: Dùng để xóa ảnh, cần lưu lại khi upload
3. **Folder**: Nên tổ chức ảnh theo folder để dễ quản lý
4. **Validation**: Luôn validate file trước khi upload
5. **Error Handling**: Xử lý lỗi network, file quá lớn, sai format
6. **Progress**: Sử dụng XMLHttpRequest để hiển thị progress khi upload
7. **Resize**: Nên resize ảnh trước khi upload để tiết kiệm bandwidth
8. **Cleanup**: Xóa ảnh cũ trên Cloudinary khi user thay đổi ảnh mới
