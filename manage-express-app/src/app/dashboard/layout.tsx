import MainLayout from '@/components/MainLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout activeMenu="dashboard">
      {children}
    </MainLayout>
  );
}
