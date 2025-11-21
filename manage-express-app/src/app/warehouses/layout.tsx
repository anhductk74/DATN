import MainLayout from '@/components/MainLayout';

export default function WarehousesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout activeMenu="warehouses">
      {children}
    </MainLayout>
  );
}
