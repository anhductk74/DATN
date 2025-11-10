import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requireAdmin>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Login />,
  },
]);
