import { Metadata } from 'next';
import TenantAdminLoginSection from '@/components/auth/TenantAdminLoginSection';
import ReduxProvider from '@/providers/ReduxProvider';

export const metadata: Metadata = {
  title: 'Admin Login | Arab Marble',
  robots: { index: false, follow: false },
};

export default function KalpTreeRootPage() {
  return (
    <ReduxProvider>
      <TenantAdminLoginSection />
    </ReduxProvider>
  );
}
