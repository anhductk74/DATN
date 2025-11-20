# Hướng dẫn tạo các Screen còn thiếu

## File template cần tạo để app hoạt động hoàn chỉnh

Đã có sẵn: ✅ Types, Services, API Client, Auth Context, LoginScreen

Còn thiếu: RegisterScreen, HomeScreen, ProductDetailScreen, CartScreen, CheckoutScreen, OrderListScreen, OrderDetailScreen, ProfileScreen và Components

---

## 1. RegisterScreen.tsx

\`\`\`typescript
// Copy LoginScreen.tsx và chỉnh sửa:
- Thêm fields: fullName, phoneNumber, confirmPassword
- Call authService.register() thay vì login()
- Validation: phone regex, password match, email format
\`\`\`

## 2. HomeScreen.tsx

\`\`\`typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { productService, categoryService } from '../services';
import { Product, Category } from '../types';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getActiveCategories(),
      ]);
      setProducts(productsData.slice(0, 10)); // Featured products
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.images?.[0] }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>
        {item.variants[0]?.price.toLocaleString()} VND
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Mall</Text>
      
      {/* Categories horizontal scroll */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryCard}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Featured Products */}
      <Text style={styles.sectionTitle}>Featured Products</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
}
\`\`\`

## 3. ProductDetailScreen.tsx

\`\`\`typescript
- Fetch product by ID
- Image carousel
- Variant selector (size, color, etc.)
- Quantity selector
- Add to Cart button
- Product description
- Reviews section
\`\`\`

## 4. CartScreen.tsx

\`\`\`typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { cartService } from '../services';
import { Cart, CartItem } from '../types';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const updated = await cartService.updateItem({ cartItemId, quantity });
      setCart(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await cartService.removeItem(cartItemId);
      await loadCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const proceedToCheckout = () => {
    if (cart && cart.items.length > 0) {
      navigation.navigate('Checkout', { cart });
    }
  };

  // Render cart items với quantity controls, remove button
  // Total amount display
  // Checkout button
}
\`\`\`

## 5. CheckoutScreen.tsx

\`\`\`typescript
- Address selection
- Payment method selection
- Order summary
- Place order button
- Call orderService.createOrder()
\`\`\`

## 6. OrderListScreen.tsx

\`\`\`typescript
import { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { orderService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export default function OrderListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    const ordersData = await orderService.getUserOrders(user!.id);
    setOrders(ordersData.content);
  };

  // Render order cards với status badge
}
\`\`\`

## 7. OrderDetailScreen.tsx

\`\`\`typescript
- Fetch order by ID
- Display order items
- Shipping info
- Tracking number
- Status timeline
- Cancel order button (if PENDING)
\`\`\`

## 8. ProfileScreen.tsx

\`\`\`typescript
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation handled by auth state
  };

  return (
    <View>
      <Image source={{ uri: user?.avatar }} style={styles.avatar} />
      <Text>{user?.fullName}</Text>
      <Text>{user?.phoneNumber}</Text>

      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
        <Text>My Addresses</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
        <Text>My Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 9. UI Components

### ProductCard.tsx
\`\`\`typescript
interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: product.images?.[0] }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>
        {product.variants[0]?.price.toLocaleString()} VND
      </Text>
      {product.averageRating && (
        <Text>⭐ {product.averageRating.toFixed(1)}</Text>
      )}
    </TouchableOpacity>
  );
};
\`\`\`

### Button.tsx, Input.tsx, Loading.tsx - Basic reusable components

## 10. Navigation Setup

### App.tsx (Root level)
\`\`\`typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import OrderListScreen from './src/screens/OrderListScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderListScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Text>Loading...</Text>;
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
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
\`\`\`

## Checklist triển khai

- [x] Types & Interfaces
- [x] API Client với token management
- [x] Services (Auth, Product, Cart, Order, Category, User)
- [x] Auth Context
- [x] LoginScreen
- [ ] RegisterScreen
- [ ] HomeScreen
- [ ] ProductDetailScreen
- [ ] CartScreen
- [ ] CheckoutScreen
- [ ] OrderListScreen
- [ ] OrderDetailScreen
- [ ] ProfileScreen
- [ ] UI Components (ProductCard, etc.)
- [ ] Navigation setup
- [ ] Error handling UI
- [ ] Loading states
- [ ] Empty states

## Chạy app sau khi hoàn thành

\`\`\`bash
# Update API URL in src/config/config.ts
# Update Google OAuth IDs in src/contexts/AuthContext.tsx

npm start
# Scan QR code với Expo Go app
\`\`\`

---

**Lưu ý:** File này là template guide. Cần implement từng screen theo cấu trúc đã gợi ý.
