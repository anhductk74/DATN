import MainLayout from '@/components/MainLayout';

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout activeMenu="finance">
      {children}
    </MainLayout>
  );
}
