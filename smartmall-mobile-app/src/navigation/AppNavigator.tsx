import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderSearchScreen from '../screens/OrderSearchScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import OrderTrackingDetailScreen from '../screens/OrderTrackingDetailScreen';
import ReviewScreen from '../screens/ReviewScreen';
import OrderReturnRequestScreen from '../screens/OrderReturnRequestScreen';
import type { CartItem } from '../services/CartService';
import type { Address } from '../services/addressService';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Addresses: undefined;
  AddEditAddress: { address?: Address } | undefined;
  Categories: undefined;
  ProductList: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: { items: CartItem[] };
  Orders: undefined;
  OrderSearch: undefined;
  OrderDetail: { orderId: string };
  OrderTrackingDetail: { orderId: string; orderStatus: string; trackingNumber?: string };
  Review: { orderId: string };
  OrderReturnRequest: { orderId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
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
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Create Account',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            headerShown: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Addresses"
          component={AddressesScreen}
          options={{
            title: 'My Addresses',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddEditAddress"
          component={AddEditAddressScreen}
          options={{
            title: 'Address',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            title: 'Categories',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{
            title: 'Products',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            title: 'Product Detail',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: 'Shopping Cart',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{
            title: 'Checkout',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            title: 'My Orders',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderSearch"
          component={OrderSearchScreen}
          options={{
            title: 'Search Orders',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{
            title: 'Order Detail',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderTrackingDetail"
          component={OrderTrackingDetailScreen}
          options={{
            title: 'Tracking Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            title: 'Write Review',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderReturnRequest"
          component={OrderReturnRequestScreen}
          options={{
            title: 'Return Request',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
