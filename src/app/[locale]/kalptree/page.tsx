import { Metadata } from 'next';
import TenantAdminLoginSection from '@/components/auth/TenantAdminLoginSection';

export const metadata: Metadata = {
  title: 'Admin Login | Arab Marble',
  robots: { index: false, follow: false },
};

export default function KalpTreePage() {
  return <TenantAdminLoginSection />;
}
