'use client';
import { useCurrency } from '@/lib/currency/useCurrency';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  selectCartDrawerOpen,
  closeCartDrawer,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  fetchCart,
  updateQuantityAsync,
  removeFromCartAsync,
  selectHasCartFetched,
  selectCartLoading,
} from '@/lib/store/cart/cartSlice';
import { formatCommercePrice } from '@/lib/commerce/product-normalization';

export default function CartDrawer({ localePrefix = '' }: { locale?: string; localePrefix?: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const isDrawerOpen = useAppSelector(selectCartDrawerOpen);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const itemCount = useAppSelector(selectCartItemCount);
  const hasCartFetched = useAppSelector(selectHasCartFetched);
  const isCartLoading = useAppSelector(selectCartLoading);

  useEffect(() => {
    if (isDrawerOpen && !hasCartFetched && !isCartLoading) {
      dispatch(fetchCart());
    }
  }, [dispatch, isDrawerOpen, hasCartFetched, isCartLoading]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        dispatch(closeCartDrawer());
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, dispatch]);

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300"
        onClick={() => dispatch(closeCartDrawer())}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[90vw] max-w-[400px] bg-[var(--surface)] shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
          <h2 className="text-lg font-bold font-serif text-[var(--text)]">
            Shopping Cart ({itemCount})
          </h2>
          <button
            onClick={() => dispatch(closeCartDrawer())}
            className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors p-2"
            aria-label="Close Cart"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <svg className="w-16 h-16 text-[var(--border)]" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-[var(--text-secondary)]">Your cart is currently empty.</p>
              <button
                onClick={() => {
                  dispatch(closeCartDrawer());
                  router.push(`${localePrefix}/shop`);
                }}
                className="btn-primary mt-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] bg-white shrink-0 relative">
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)] leading-tight mb-1">
                        {item.name}
                      </h3>
                      {item.selectedOptions && (item.selectedOptions.size || item.selectedOptions.length || item.selectedOptions.color) ? (
                        <p className="text-xs text-[var(--text-secondary)] mb-1">
                          {[
                            item.selectedOptions.size,
                            item.selectedOptions.length,
                            item.selectedOptions.color,
                          ]
                            .filter(Boolean)
                            .join(' / ')}
                        </p>
                      ) : item.variantName ? (
                        <p className="text-xs text-[var(--text-secondary)] mb-1">
                          {item.variantName}
                        </p>
                      ) : null}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-[var(--primary)]">{formatPrice(item.price)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-auto">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[var(--border)] rounded-full px-2 py-1 bg-white">
                        <button
                          onClick={() => dispatch(updateQuantityAsync({ cartItemId: item.cartItemId, quantity: item.quantity - 1 }))}
                          className="px-2 text-[var(--text-secondary)] hover:text-[var(--text)] font-bold text-sm"
                          disabled={item.quantity <= 1}
                        >
                          &minus;
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-[var(--text-primary)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(updateQuantityAsync({ cartItemId: item.cartItemId, quantity: item.quantity + 1 }))}
                          className="px-2 text-[var(--text-secondary)] hover:text-[var(--text)] font-bold text-sm"
                          disabled={item.quantity >= item.maxQuantity}
                        >
                          &#43;
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button className="text-[var(--text-muted)] hover:text-[var(--text)]">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCartAsync(item.cartItemId))}
                          className="text-[var(--text-muted)] hover:text-[var(--primary)]"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 bg-[var(--surface)] border-t border-[var(--border)] shrink-0 space-y-4">
            
            <div className="flex border border-[var(--border)] rounded-md overflow-hidden bg-white">
              <button className="flex-1 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center justify-center gap-2 border-r border-[var(--border)]">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 2v4h4" />
                </svg>
                Add Note
              </button>
              <button className="flex-1 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] flex items-center justify-center gap-2">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Estimate
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-[var(--text)]">Subtotal</span>
              <span className="font-bold text-lg text-[var(--text-primary)]">
                {formatPrice(total)}
              </span>
            </div>

            <button
              onClick={() => {
                dispatch(closeCartDrawer());
                router.push(`${localePrefix}/cart`);
              }}
              className="btn-secondary w-full justify-center"
            >
              View Cart
            </button>

            <button
              onClick={() => {
                dispatch(closeCartDrawer());
                router.push(`${localePrefix}/checkout`);
              }}
              className="btn-primary w-full justify-center shadow-md"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
