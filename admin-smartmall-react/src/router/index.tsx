import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Logout from '../pages/Logout/Logout';
import Products from '../pages/Products/Products';
import Categories from '../pages/Categories/Categories';
import Brands from '../pages/Brands/Brands';
import Orders from '../pages/Orders/Orders';
import PendingOrders from '../pages/Orders/PendingOrders';
import CompletedOrders from '../pages/Orders/CompletedOrders';
import Stores from '../pages/Stores/Stores';
import TopShops from '../pages/Stores/TopShops';
import Customers from '../pages/Customers/Customers';
import Users from '../pages/Users/Users';
import Managers from '../pages/Managers/Managers';
import RegisterManager from '../pages/Managers/RegisterManager';
import Vouchers from '../pages/Vouchers/Vouchers';
import Wallets from '../pages/Wallets/Wallets';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout/AdminLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Products routes
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'products/categories',
        element: <Categories />,
      },
      {
        path: 'products/brands',
        element: <Brands />,
      },
      // Orders routes
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'orders/pending',
        element: <PendingOrders />,
      },
      {
        path: 'orders/completed',
        element: <CompletedOrders />,
      },
      // Stores route
      {
        path: 'stores',
        element: <Stores />,
      },
      {
        path: 'stores/top',
        element: <TopShops />,
      },
      // Customers routes
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'customers/reviews',
        element: <div>Reviews Page (Coming Soon)</div>,
      },
      // Users route
      {
        path: 'users',
        element: <Users />,
      },
      // Managers routes
      {
        path: 'managers',
        element: <Managers />,
      },
      {
        path: 'managers/register',
        element: <RegisterManager />,
      },
      // Voucher routes
      {
        path: 'vouchers',
        element: <Vouchers />,
      },
      {
        path: 'vouchers/system',
        element: <Vouchers />,
      },
      {
        path: 'vouchers/shop',
        element: <Vouchers />,
      },
      {
        path: 'vouchers/shipping',
        element: <Vouchers />,
      },
      // Wallets route
      {
        path: 'wallets',
        element: <Wallets />,
      },
      // Marketing routes (deprecated - redirects to vouchers)
      {
        path: 'marketing/coupons',
        element: <Vouchers />,
      },
      {
        path: 'marketing/promotions',
        element: <div>Promotions Page (Coming Soon)</div>,
      },
      {
        path: 'marketing/banners',
        element: <div>Banners Page (Coming Soon)</div>,
      },
      // Analytics route
      {
        path: 'analytics',
        element: <div>Analytics Page (Coming Soon)</div>,
      },
      // Reports route
      {
        path: 'reports',
        element: <div>Reports Page (Coming Soon)</div>,
      },
      // Settings route
      {
        path: 'settings',
        element: <div>Settings Page (Coming Soon)</div>,
      },
      // Profile route
      {
        path: 'profile',
        element: <div>Profile Page (Coming Soon)</div>,
      },
    ],
  },
  {
    path: '/logout',
    element: (
      <ProtectedRoute requireAdmin>
        <Logout />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Login />,
  },
]);
