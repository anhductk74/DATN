# Smart Mall Mobile App

Mobile application cho Smart Mall - Ứng dụng bán hàng trực tuyến với React Native và Expo.

## 🚀 Tính năng chính

### ✅ Đã hoàn thành

#### 1. **Authentication**
- ✅ Login với username/password
- ✅ Register tài khoản mới
- ✅ Google OAuth login
- ✅ JWT token management với auto-refresh
- ✅ Persistent login state

#### 2. **Services & API Integration**
- ✅ API Client với Axios interceptors
- ✅ Token management (AsyncStorage)
- ✅ Auto token refresh
- ✅ Auth Service
- ✅ Product Service
- ✅ Cart Service
- ✅ Order Service
- ✅ Category Service
- ✅ User Service

#### 3. **TypeScript Support**
- ✅ Full TypeScript interfaces
- ✅ Type-safe API calls
- ✅ Reusable types from Next.js app

### 🚧 Cần hoàn thiện

#### 4. **Screens cần tạo thêm**

**Home & Browse:**
```typescript
// src/screens/HomeScreen.tsx - Trang chủ
- Featured products
- Categories grid
- Search bar
- Banner/Promotions

// src/screens/CategoryScreen.tsx - Danh mục
- Category list
- Category products

// src/screens/SearchScreen.tsx - Tìm kiếm
- Search input
- Search results
- Filters
```

**Products:**
```typescript
// src/screens/ProductListScreen.tsx
- Product grid/list
- Filters (price, brand, category)
- Sort options

// src/screens/ProductDetailScreen.tsx
- Product images slider
- Variant selection
- Add to cart
- Product description
- Reviews

// src/screens/RegisterScreen.tsx - Đăng ký
- Full registration form
- Phone validation
- Password strength
```

**Cart & Checkout:**
```typescript
// src/screens/CartScreen.tsx
- Cart items list
- Quantity adjustment
- Remove items
- Total calculation
- Checkout button

// src/screens/CheckoutScreen.tsx
- Shipping address selection
- Payment method
- Order summary
- Place order

// src/screens/PaymentScreen.tsx
- Payment integration (VNPay, etc.)
```

**Orders:**
```typescript
// src/screens/OrderListScreen.tsx
- Order history
- Order status
- Filter by status

// src/screens/OrderDetailScreen.tsx
- Order items
- Shipping info
- Tracking
- Cancel order option
```

**Profile:**
```typescript
// src/screens/ProfileScreen.tsx
- User info display
- Edit profile
- Addresses
- Wallet balance
- Settings

// src/screens/EditProfileScreen.tsx
- Update user info
- Change avatar
- Update phone, DOB, gender

// src/screens/AddressesScreen.tsx
- Address list
- Add/Edit/Delete address
- Set default address

// src/screens/WalletScreen.tsx
- Wallet balance
- Transaction history
- Top up wallet
```

#### 5. **Components cần tạo**

```typescript
// src/components/ui/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

// src/components/ui/CategoryCard.tsx
// src/components/ui/OrderCard.tsx
// src/components/ui/CartItem.tsx
// src/components/ui/Button.tsx
// src/components/ui/Input.tsx
// src/components/ui/LoadingSpinner.tsx
// src/components/ui/EmptyState.tsx
```

#### 6. **Navigation**

```typescript
// app/navigation/RootNavigator.tsx
- Stack Navigator
- Bottom Tab Navigator
- Auth flow
- Main app flow

// Tabs:
- Home
- Categories
- Cart
- Orders
- Profile
```

## 📦 Cài đặt

```bash
cd smartmall-mobile-app
npm install
```

## 🔧 Cấu hình

### 1. Cập nhật API URL

Chỉnh sửa `src/config/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_API_URL:8080/api', // Thay bằng IP máy backend
  TIMEOUT: 30000,
};
```

### 2. Cấu hình Google OAuth

Cập nhật `src/contexts/AuthContext.tsx`:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
  iosClientId: 'YOUR_IOS_CLIENT_ID',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  webClientId: 'YOUR_WEB_CLIENT_ID',
});
```

## 🚀 Chạy ứng dụng

```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📱 Cấu trúc thư mục

```
smartmall-mobile-app/
├── src/
│   ├── config/           # Configuration files
│   │   └── config.ts
│   ├── types/            # TypeScript types
│   │   ├── auth.ts
│   │   ├── common.ts
│   │   └── index.ts
│   ├── lib/              # Utilities
│   │   └── apiClient.ts  # Axios client với interceptors
│   ├── services/         # API services
│   │   ├── AuthService.ts
│   │   ├── ProductService.ts
│   │   ├── CartService.ts
│   │   ├── OrderService.ts
│   │   ├── CategoryService.ts
│   │   ├── UserService.ts
│   │   └── index.ts
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── screens/          # Screen components
│   │   └── LoginScreen.tsx
│   └── components/       # Reusable components
│       └── ui/
├── app/                  # Expo Router screens
├── assets/               # Images, fonts, etc.
└── package.json
```

## 🔑 Tính năng chính đã implement

### Authentication Flow

1. **Login**
   - Username/password authentication
   - JWT token storage
   - Auto-refresh token

2. **Register**
   - User registration
   - Auto login after registration

3. **Google OAuth**
   - Google Sign-In
   - Auto-create user on first login
   - Random password generation for Google users

### API Integration

- **Axios Instance** với auto token refresh
- **Interceptors** để inject token vào mọi request
- **Error handling** và retry logic
- **AsyncStorage** cho token persistence

### State Management

- **AuthContext** với hooks
- Centralized user state
- Loading states
- Authentication status

## 📝 Hướng dẫn tiếp tục phát triển

### 1. Tạo Navigation

```bash
# Tạo file navigation
mkdir -p app/navigation
```

Tạo `app/navigation/RootNavigator.tsx`:

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../src/contexts/AuthContext';

// Import screens
import LoginScreen from '../src/screens/LoginScreen';
import HomeScreen from '../src/screens/HomeScreen';
// ... other imports

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoryScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrderListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          {/* Add more screens */}
        </>
      )}
    </Stack.Navigator>
  );
}
```

### 2. Cập nhật App.tsx

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './app/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

### 3. Tạo UI Components

Tạo các component tái sử dụng trong `src/components/ui/`

### 4. Tạo các Screen còn lại

Tham khảo cấu trúc từ LoginScreen để tạo các screen khác.

## 🎨 Thiết kế

- **Color Scheme**: 
  - Primary: #6366f1 (Indigo)
  - Background: #fff
  - Text: #374151
  - Border: #e5e7eb

- **Components**: Material Design inspired
- **Icons**: Ionicons from @expo/vector-icons

## 🔐 Bảo mật

- ✅ JWT tokens stored in AsyncStorage
- ✅ Auto token refresh
- ✅ Secure API communication
- ✅ Password validation
- ✅ Input sanitization

## 📚 Dependencies chính

- **React Native**: 0.81.5
- **Expo**: ~54.0.25
- **Axios**: Latest
- **@react-native-async-storage/async-storage**: Latest
- **expo-auth-session**: Latest
- **@react-navigation/native**: ^7.1.8
- **@react-navigation/native-stack**: Latest
- **@react-navigation/bottom-tabs**: ^7.4.0

## 🤝 Contributing

1. Clone types từ `smart-mall-nextapp/src/types`
2. Clone services structure từ `smart-mall-nextapp/src/services`
3. Adapt cho React Native (không dùng Next.js specific features)

## 📄 License

Private project - DATN

---

**Next Steps:**
1. ✅ Setup done - Types, Services, Auth Context
2. 🚧 Create Navigation structure
3. 🚧 Create remaining screens
4. 🚧 Create UI components
5. 🚧 Test full user flow
6. 🚧 Add error handling UI
7. 🚧 Add loading states
8. 🚧 Polish UI/UX
