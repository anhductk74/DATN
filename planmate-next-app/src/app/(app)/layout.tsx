import { AppLayout } from '../../components/AppLayout';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}
