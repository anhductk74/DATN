import MainLayout from '@/components/MainLayout';

export default function ShippersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout activeMenu="shippers">
      {children}
    </MainLayout>
  );
}
