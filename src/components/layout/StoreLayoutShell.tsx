'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminBar from '@/components/layout/AdminBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EditModeToggle from '@/components/layout/EditModeToggle/EditModeToggle';
import LocaleNotice from '@/components/locale-notice/LocaleNotice';
import { ReferenceEditorProvider, ReferenceEditorDrawer } from '@/components/cms/reference-editor';

interface StoreLayoutShellProps {
  children: React.ReactNode;
  locale: string;
  localePrefix: string;
  initialBrandAssets?: {
    logoUrl?: string;
    faviconUrl?: string;
    brandName?: string;
  };
}

export default function StoreLayoutShell({
  children,
  locale,
  localePrefix,
  initialBrandAssets,
}: StoreLayoutShellProps) {
  const pathname = usePathname() || '';

  const isAuthPage =
    pathname === '/login' ||
    pathname.endsWith('/login') ||
    pathname === '/signup' ||
    pathname.endsWith('/signup');

  const isExcluded =
    pathname.includes('/kalptree') ||
    pathname.includes('/kalp-admin') ||
    pathname.includes('/studio') ||
    pathname.includes('/admin') ||
    isAuthPage;

  if (isExcluded) {
    return <main id="main-content" className="min-h-screen w-full">{children}</main>;
  }

  return (
    <ReferenceEditorProvider>
      <LocaleNotice />
      <AdminBar />
      <Header />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
      <EditModeToggle />
      <ReferenceEditorDrawer />
    </ReferenceEditorProvider>
  );
}
