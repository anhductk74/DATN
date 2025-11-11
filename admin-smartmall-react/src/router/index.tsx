import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Logout from '../pages/Logout/Logout';
import Products from '../pages/Products/Products';
import Categories from '../pages/Categories/Categories';
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
        element: <div>Brands Page (Coming Soon)</div>,
      },
      // Orders routes
      {
        path: 'orders',
        element: <div>Orders Page (Coming Soon)</div>,
      },
      {
        path: 'orders/pending',
        element: <div>Pending Orders (Coming Soon)</div>,
      },
      {
        path: 'orders/completed',
        element: <div>Completed Orders (Coming Soon)</div>,
      },
      // Stores route
      {
        path: 'stores',
        element: <div>Stores Page (Coming Soon)</div>,
      },
      // Customers routes
      {
        path: 'customers',
        element: <div>Customers Page (Coming Soon)</div>,
      },
      {
        path: 'customers/reviews',
        element: <div>Reviews Page (Coming Soon)</div>,
      },
      // Users route
      {
        path: 'users',
        element: <div>Users Management (Coming Soon)</div>,
      },
      // Marketing routes
      {
        path: 'marketing/coupons',
        element: <div>Coupons Page (Coming Soon)</div>,
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
