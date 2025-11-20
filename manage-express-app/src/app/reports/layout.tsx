import MainLayout from '@/components/MainLayout';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout activeMenu="reports">
      {children}
    </MainLayout>
  );
}
