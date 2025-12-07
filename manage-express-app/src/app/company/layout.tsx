import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return <MainLayout activeMenu="company">{children}</MainLayout>;
}
