# Address API Integration Fix & English Translation

## 🔍 Changes Overview
Fixed delivery address component to match backend API specification and converted all UI text to English.

## 📝 API Specification (from USER_ADDRESS.md)

### Required Fields for Create/Update:
```json
{
  "recipient": string,        // Full name (was: fullName)
  "phoneNumber": string,      // Phone number
  "addressType": enum,        // HOME | WORK | OTHER (NEW)
  "street": string,          // Street address (was: addressLine)
  "commune": string,         // Ward/Commune (was: ward)
  "district": string,        // District
  "city": string,           // City/Province
  "isDefault": boolean      // Is default address
}
```

### Response Format:
```json
{
  "id": "uuid",
  "recipient": "Nguyễn Văn A",
  "phoneNumber": "0987654321",
  "addressType": "HOME",
  "street": "123 Đường ABC",
  "commune": "Phường XYZ",
  "district": "Quận 1",
  "city": "TP.HCM",
  "fullAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "isDefault": true,
  "createdAt": "2023-01-01T00:00:00",
  "updatedAt": "2023-01-01T00:00:00"
}
```

## ✅ Files Updated

### 1. addressService.ts
**Changes:**
- Added `AddressType` enum: `'HOME' | 'WORK' | 'OTHER'`
- Renamed fields to match API:
  - `fullName` → `recipient`
  - `addressLine` → `street`
  - `ward` → `commune`
- Added `addressType` field
- Added `fullAddress` field in response

**Before:**
```typescript
export interface Address {
  fullName: string;
  addressLine: string;
  ward: string;
  // ...
}
```

**After:**
```typescript
export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  recipient: string;
  street: string;
  commune: string;
  addressType: AddressType;
  fullAddress: string;
  // ...
}
```

### 2. DeliveryAddress.tsx
**Changes:**

#### Type Updates:
- Updated `DeliveryAddress` interface to use `AddressType`
- Changed `type: 'home' | 'office' | 'other'` → `type: AddressType`

#### API Field Mapping:
```typescript
// Transform API response to UI format
const transformApiAddressToLocal = (apiAddress: Address): DeliveryAddress => {
  return {
    id: apiAddress.id,
    name: apiAddress.recipient,        // ← Changed from fullName
    phone: apiAddress.phoneNumber,
    address: apiAddress.street,        // ← Changed from addressLine
    ward: apiAddress.commune,          // ← Changed from ward
    district: apiAddress.district,
    city: apiAddress.city,
    isDefault: apiAddress.isDefault,
    type: apiAddress.addressType       // ← Now properly typed
  };
};
```

#### Create/Update Request Mapping:
```typescript
// Create new address
const createData: CreateAddressRequest = {
  recipient: values.name,
  phoneNumber: values.phone,
  addressType: values.type,        // HOME | WORK | OTHER
  street: values.address,
  commune: ward.name,              // ← Changed from ward
  district: district.name,
  city: province.name,
  isDefault: addresses.length === 0
};
```

#### UI Type Comparisons Fixed:
```typescript
// Before
{address.type === 'home' ? <HomeOutlined /> : ...}

// After
{address.type === 'HOME' ? <HomeOutlined /> : ...}
```

#### Radio Group Values Updated:
```typescript
<Radio.Group>
  <Radio value="HOME">        {/* was: 'home' */}
    <HomeOutlined className="mr-1" />
    Home
  </Radio>
  <Radio value="WORK">        {/* was: 'office' */}
    <ShopOutlined className="mr-1" />
    Work
  </Radio>
  <Radio value="OTHER">       {/* was: 'other' */}
    <EnvironmentOutlined className="mr-1" />
    Other
  </Radio>
</Radio.Group>
```

### 3. checkout/page.tsx
**Changes:**
- Updated mock data types from lowercase to uppercase:
  - `type: 'home'` → `type: 'HOME'`
  - `type: 'office'` → `type: 'WORK'`

## 🌐 English Translation

All UI text converted from Vietnamese to English:

| Vietnamese | English |
|-----------|---------|
| Địa Chỉ Giao Hàng | Delivery Address |
| Thay Đổi | Change |
| Chọn Địa Chỉ Giao Hàng | Select Delivery Address |
| Thêm Địa Chỉ Mới | Add New Address |
| Đang tải... | Loading... |
| Chưa có địa chỉ nào | No addresses yet |
| Vui lòng thêm địa chỉ giao hàng | Please add a delivery address |
| Sửa | Edit |
| Đặt Mặc Định | Set Default |
| Xóa | Delete |
| Sửa Địa Chỉ | Edit Address |
| Họ và Tên | Full Name |
| Số Điện Thoại | Phone Number |
| Loại Địa Chỉ | Address Type |
| Nhà Riêng | Home |
| Văn Phòng | Work |
| Khác | Other |
| Tỉnh/Thành Phố | Province/City |
| Quận/Huyện | District |
| Phường/Xã | Ward/Commune |
| Địa Chỉ Chi Tiết | Detailed Address |
| Hủy | Cancel |
| Cập Nhật Địa Chỉ | Update Address |
| Thêm Địa Chỉ | Add Address |

## 🎯 Error Messages Updated

| Vietnamese | English |
|-----------|---------|
| Không thể tải danh sách địa chỉ | Failed to load address list |
| Bạn có chắc chắn muốn xóa địa chỉ này? | Are you sure you want to delete this address? |
| Đã xóa địa chỉ thành công | Address deleted successfully |
| Không thể xóa địa chỉ | Failed to delete address |
| Đã đặt làm địa chỉ mặc định | Set as default address successfully |
| Không thể đặt địa chỉ mặc định | Failed to set default address |
| Vui lòng chọn địa chỉ hợp lệ | Please select a valid address |
| Đã cập nhật địa chỉ thành công! | Address updated successfully! |
| Đã thêm địa chỉ mới thành công! | New address added successfully! |
| Không thể lưu địa chỉ. Vui lòng thử lại. | Failed to save address. Please try again. |

## 📊 Field Validation

### Phone Number
```typescript
{ 
  pattern: /^[0-9]{10,11}$/, 
  message: 'Invalid phone number' 
}
```

### Address Type
- **Required**: Must be one of HOME, WORK, OTHER
- **Default**: HOME (when creating new address)
- **Visual**: Icon-based radio buttons

## 🎨 AddressType Icons

```typescript
const getAddressIcon = (type: AddressType) => {
  switch(type) {
    case 'HOME': return <HomeOutlined />;
    case 'WORK': return <ShopOutlined />;
    case 'OTHER': return <EnvironmentOutlined />;
  }
};
```

## ✅ Build Status
- **Status**: ✅ SUCCESS
- **Compile Time**: 34.9s
- **Route Size**: 130 kB (checkout page)
- **TypeScript**: All type errors resolved

## 🔗 API Integration Points

### 1. Load Addresses
```typescript
const apiAddresses = await addressService.getAddresses();
const transformedAddresses = apiAddresses.map(transformApiAddressToLocal);
```

### 2. Create Address
```typescript
const createData: CreateAddressRequest = {
  recipient: values.name,
  phoneNumber: values.phone,
  addressType: values.type,
  street: values.address,
  commune: ward.name,
  district: district.name,
  city: province.name,
  isDefault: addresses.length === 0
};
await addressService.createAddress(createData);
```

### 3. Update Address
```typescript
const updateData: UpdateAddressRequest = {
  recipient: values.name,
  phoneNumber: values.phone,
  addressType: values.type,
  street: values.address,
  commune: ward.name,
  district: district.name,
  city: province.name
};
await addressService.updateAddress(addressId, updateData);
```

### 4. Delete Address
```typescript
await addressService.deleteAddress(addressId);
await loadAddressesFromAPI(); // Reload after deletion
```

### 5. Set Default Address
```typescript
await addressService.updateAddress(addressId, { isDefault: true });
await loadAddressesFromAPI(); // Reload to reflect changes
```

## 🎉 Benefits

1. **API Compliance**: All fields now match backend API specification
2. **Type Safety**: Proper TypeScript enums for AddressType
3. **Internationalization**: English UI ready for global users
4. **Better UX**: Clear, professional English labels and messages
5. **Consistency**: Uniform field naming across frontend and backend

## 🧪 Testing Checklist

- [x] Load addresses from API
- [x] Create new address with addressType
- [x] Update existing address
- [x] Delete address
- [x] Set default address
- [x] Address type icons display correctly
- [x] All UI text in English
- [x] TypeScript compilation successful
- [x] No type errors
- [x] Build successful
