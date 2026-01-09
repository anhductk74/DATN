import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressesScreen from '../screens/AddressesScreen';
import AddEditAddressScreen from '../screens/AddEditAddressScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import SearchScreen from '../screens/SearchScreen';
import FlashSalesScreen from '../screens/FlashSalesScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderSearchScreen from '../screens/OrderSearchScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import OrderTrackingDetailScreen from '../screens/OrderTrackingDetailScreen';
import ReviewScreen from '../screens/ReviewScreen';
import OrderReturnRequestScreen from '../screens/OrderReturnRequestScreen';
import { NotificationProvider } from '../contexts/NotificationContext';
import { NotificationBell } from '../components/NotificationBell';
import type { CartItem } from '../services/CartService';
import type { Address } from '../services/addressService';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ProductList: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string };
  AllProducts: undefined;
  FlashSales: undefined;
  Search: { query?: string } | undefined;
  Checkout: { items: CartItem[] };
  Addresses: undefined;
  AddEditAddress: { address?: Address } | undefined;
  Wishlist: undefined;
  OrderSearch: undefined;
  OrderDetail: { orderId: string };
  OrderTrackingDetail: { orderId: string; orderStatus: string; trackingNumber?: string };
  Review: { orderId: string };
  OrderReturnRequest: { orderId: string };
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Header Right Component with all icons
const HeaderRightIcons = ({ navigation }: any) => (
  <View style={headerStyles.headerRight}>
    <TouchableOpacity 
      style={headerStyles.iconButton}
      onPress={() => navigation.navigate('Wishlist')}
    >
      <Ionicons name="heart-outline" size={24} color="#fff" />
    </TouchableOpacity>
    <NotificationBell />
  </View>
);

const headerStyles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === 'Categories') {
            return <MaterialCommunityIcons name="view-grid" size={size} color={color} />;
          } else if (route.name === 'Cart') {
            return <Ionicons name="cart-outline" size={size} color={color} />;
          } else if (route.name === 'Orders') {
            return <Ionicons name="cube-outline" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name="person-outline" size={size} color={color} />;
          }
          return <Ionicons name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingVertical: 12,
          paddingBottom: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShown: false,
          }}
        >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Create Account',
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={({ navigation }) => ({
            headerShown: true,
            headerRight: () => <HeaderRightIcons navigation={navigation} />,
            title: 'Smart Mall',
          })}
        />
        <Stack.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            title: 'My Wishlist',
            headerShown: true,
            headerRight: () => <NotificationBell />,
          }}
        />
        <Stack.Screen
          name="AllProducts"
          component={AllProductsScreen}
          options={{
            title: 'All Products',
          }}
        />
        <Stack.Screen
          name="FlashSales"
          component={FlashSalesScreen}
          options={{
            title: 'Flash Sales',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search',
          }}
        />
        <Stack.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{
            title: 'Products',
          }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            title: 'Product Detail',
          }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{
            title: 'Checkout',
          }}
        />
        <Stack.Screen
          name="Addresses"
          component={AddressesScreen}
          options={{
            title: 'My Addresses',
          }}
        />
        <Stack.Screen
          name="AddEditAddress"
          component={AddEditAddressScreen}
          options={{
            title: 'Address',
          }}
        />
        <Stack.Screen
          name="OrderSearch"
          component={OrderSearchScreen}
          options={{
            title: 'Search Orders',
          }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{
            title: 'Order Detail',
            headerShown: true,
            headerRight: () => <NotificationBell />,
          }}
        />
        <Stack.Screen
          name="OrderTrackingDetail"
          component={OrderTrackingDetailScreen}
          options={{
            title: 'Tracking Details',
          }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            title: 'Write Review',
          }}
        />
        <Stack.Screen
          name="OrderReturnRequest"
          component={OrderReturnRequestScreen}
          options={{
            title: 'Return Request',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}
