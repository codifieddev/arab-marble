'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectCartItemCount } from '@/lib/store/cart/cartSlice';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useEffect, useState } from 'react';
import { resolveHrefWithPermalinks } from '@/lib/permalink/url-helper';

export default function MobileBottomNav({ locale = 'en', localePrefix = '' }: { locale?: string; localePrefix?: string }) {
  const pathname = usePathname();
  const cartCount = useAppSelector(selectCartItemCount);
  const scrollDirection = useScrollDirection();
  const [mounted, setMounted] = useState(false);

  if (pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/studio')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      label: 'Account',
      href: '/account',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    },
    {
      label: 'Wishlist',
      href: '/', // Temporary fallback since wishlist is not implemented
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      badge: true
    }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] z-[1000] flex items-center justify-around pb-safe lg:hidden shadow-[0_-4px_16px_rgba(61,46,46,0.05)] h-[64px] transition-transform duration-300 ease-in-out ${scrollDirection === 'up' ? 'translate-y-[100%]' : 'translate-y-0'}`}>
      {navItems.map((item, index) => {
        const resolvedHref = resolveHrefWithPermalinks(item.href, locale);
        const fullHref = resolvedHref !== item.href
          ? resolvedHref
          : (item.href === '/' ? (localePrefix || '/') : `${localePrefix}${item.href}`);
        const isActive = pathname === fullHref ||
          pathname === resolvedHref ||
          (item.href !== '/' && (pathname.startsWith(fullHref) || pathname.startsWith(resolvedHref)));
        
        return (
          <Link
            key={index}
            href={fullHref}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 pt-1 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            <div className="relative flex items-center justify-center">
              {item.icon}
              {item.badge && mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[var(--primary)] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
