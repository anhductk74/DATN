'use client';

import MainLayout from '@/components/MainLayout';

export default function ShipmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
