import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <MainLayout activeMenu="profile">{children}</MainLayout>;
}
