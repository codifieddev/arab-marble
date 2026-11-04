'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { PageBlock } from '@/lib/store/pages/pageType';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { removeFromCartAsync, updateQuantityAsync } from '@/lib/store/cart/cartSlice';
import { formatCommercePrice } from '@/lib/commerce/product-normalization';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

import { selectBlueprint } from '@/lib/store/blueprint';

interface CartSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function CartSection({ block, locale = 'en', localePrefix = '', isEditable, onSave }: CartSectionProps) {
  const props = block.props || {};
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(s => s.cart.items);
  const currency = items[0]?.currency || 'USD';
  const blueprint = useAppSelector(selectBlueprint);

  const commerce = {
    ...((blueprint as any)?.verticals?.commerce?.configuration || {}),
    ...(blueprint?.commerce || {}),
  };

  const freeShippingThreshold = (() => {
    const minor = commerce?.shipping?.freeShippingThresholdMinor ?? commerce?.freeShippingThresholdMinor;
    if (minor !== undefined && Number(minor) > 0) return Number(minor) / 100;
    const direct = commerce?.shipping?.freeShippingThreshold ?? commerce?.freeShippingThreshold;
    if (direct !== undefined && Number(direct) > 0) {
      return Number(direct) > 1000 ? Number(direct) / 100 : Number(direct);
    }
    return 50;
  })();

  const flatShippingCost = (() => {
    const minor = commerce?.shipping?.flatShippingCostMinor ?? commerce?.shippingCostMinor;
    if (minor !== undefined && Number(minor) > 0) return Number(minor) / 100;
    const direct = commerce?.shipping?.flatShippingCost ?? commerce?.shippingCost ?? commerce?.shipping?.flatRate;
    if (direct !== undefined && Number(direct) > 0) {
      return Number(direct) > 1000 ? Number(direct) / 100 : Number(direct);
    }
    return 9.99;
  })();

  const headingText = t(props.heading, locale) || (locale === 'hi' ? 'आपकी कार्ट' : 'Your Cart');
  const homeText = t(props.breadcrumbHomeLabel, locale) || (locale === 'hi' ? 'होम' : 'Home');
  const colorLabel = t(props.colorPrefix, locale) || (locale === 'hi' ? 'रंग' : 'Color');
  const sizeLabel = t(props.sizePrefix, locale) || (locale === 'hi' ? 'साइज़' : 'Size');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) || items.length === 0 ? 0 : flatShippingCost;
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <h1 className="sec-title" style={{ margin: 0, fontSize: 'clamp(24px, 3.5vw, 32px)', color: 'var(--text)' }}>{headingText}</h1>
            <button 
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push(`${localePrefix}/`);
                }
              }}
              style={{
                background: 'var(--border)',
                border: 'none',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'background 0.28s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--border)'}
              aria-label="Close"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-[var(--border)] mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {onSave && isEditable ? (
              <EditableText value={t(props.emptyTitle, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyTitle', val)} isEditable={isEditable} tag="h2" className="section-title" placeholder="Empty title..." />
            ) : (
              <h2 className="section-title">{t(props.emptyTitle, locale)}</h2>
            )}
            {onSave && isEditable ? (
              <EditableText value={t(props.emptyDescription, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyDescription', val)} isEditable={isEditable} tag="p" className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto" placeholder="Empty description..." />
            ) : (
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{t(props.emptyDescription, locale)}</p>
            )}
            {onSave && isEditable ? (
              <EditableText value={t(props.emptyCtaLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyCtaLabel', val)} isEditable={isEditable} tag="span" className="btn-primary inline-flex items-center gap-2" placeholder="CTA..." />
            ) : (
              <Link href={`${localePrefix}/shop`} className="btn-primary inline-flex items-center gap-2">
                {t(props.emptyCtaLabel, locale)}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          {onSave && isEditable ? (
            <EditableText value={homeText} onSave={(val) => onSave(block.id, 'props.breadcrumbHomeLabel', val)} isEditable={isEditable} tag="span" className="hover:text-[var(--primary)]" placeholder="Home..." />
          ) : (
            <Link href={`${localePrefix}/`} className="hover:text-[var(--primary)]">{homeText}</Link>
          )}
          <span>/</span>
          {onSave && isEditable ? (
            <EditableText value={t(props.breadcrumbLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text)]" placeholder="Breadcrumb..." />
          ) : (
            <span className="text-[var(--text)]">{t(props.breadcrumbLabel, locale)}</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          <h1 className="sec-title" style={{ margin: 0, fontSize: 'clamp(24px, 3.5vw, 32px)', color: 'var(--text)' }}>{headingText}</h1>
          <button 
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push(`${localePrefix}/`);
              }
            }}
            style={{
              background: 'var(--border)',
              border: 'none',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)',
              transition: 'background 0.28s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--border)'}
            aria-label="Close"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-[var(--border)] rounded-[var(--radius-lg)] mb-4">
                <div className="relative w-24 h-24 rounded-[var(--radius-md)] overflow-hidden bg-[var(--background)] flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain object-center" sizes="96px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="card-title">{item.name}</h3>
                  {item.color && (
                    <p className="small-text mt-1">{colorLabel}: {item.color}</p>
                  )}
                  {item.size && (
                    <p className="small-text">{sizeLabel}: {item.size}</p>
                  )}
                  <p className="price-sm mt-1">{formatCommercePrice(item.price, item.currency)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[var(--border)] rounded-full">
                      <button
                        className="w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-[var(--accent-soft)] rounded-l-full"
                        onClick={() => {
                          if (item.quantity > 1) {
                            dispatch(updateQuantityAsync({ cartItemId: item.cartItemId, quantity: item.quantity - 1 }));
                          } else {
                            dispatch(removeFromCartAsync(item.cartItemId));
                          }
                        }}
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        className="w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-[var(--accent-soft)] rounded-r-full"
                        onClick={() => {
                          if (item.quantity < item.maxQuantity) dispatch(updateQuantityAsync({ cartItemId: item.cartItemId, quantity: item.quantity + 1 }));
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      onClick={() => dispatch(removeFromCartAsync(item.cartItemId))}
                    >
                      {onSave && isEditable ? (
                        <EditableText value={t(props.removeLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.removeLabel', val)} isEditable={isEditable} tag="span" placeholder="Remove..." />
                      ) : (
                        t(props.removeLabel, locale)
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold">{formatCommercePrice(item.price * item.quantity, item.currency)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 self-start h-auto">
            {onSave && isEditable ? (
              <EditableText value={t(props.orderSummaryTitle, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderSummaryTitle', val)} isEditable={isEditable} tag="h3" className="font-bold text-lg mb-4" placeholder="Order summary title..." />
            ) : (
              <h3 className="font-bold text-lg mb-4">{t(props.orderSummaryTitle, locale)}</h3>
            )}

            {freeShippingRemaining > 0 && (
              <div className="bg-[var(--accent-soft)] rounded-[var(--radius-sm)] p-3 mb-4 text-xs text-[var(--text-secondary)]">
                {onSave && isEditable ? (
                  <EditableText value={t(props.shippingThresholdLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingThresholdLabel', val)} isEditable={isEditable} tag="p" placeholder="Shipping threshold..." />
                ) : (
                  t(props.shippingThresholdLabel, locale)?.replace('{amount}', formatCommercePrice(freeShippingRemaining, currency))
                )}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                {onSave && isEditable ? (
                  <EditableText value={t(props.subtotalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.subtotalLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text-secondary)]" placeholder="Subtotal..." />
                ) : (
                  <span className="text-[var(--text-secondary)]">{t(props.subtotalLabel, locale)}</span>
                )}
                <span>{formatCommercePrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                {onSave && isEditable ? (
                  <EditableText value={t(props.shippingLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text-secondary)]" placeholder="Shipping..." />
                ) : (
                  <span className="text-[var(--text-secondary)]">{t(props.shippingLabel, locale)}</span>
                )}
                <span>{shipping === 0 ? (onSave && isEditable ? <EditableText value={t(props.shippingFreeLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.shippingFreeLabel', val)} isEditable={isEditable} tag="span" placeholder="Free..." /> : t(props.shippingFreeLabel, locale)) : formatCommercePrice(shipping, currency)}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-3 flex justify-between font-bold text-base">
                {onSave && isEditable ? (
                  <EditableText value={t(props.totalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.totalLabel', val)} isEditable={isEditable} tag="span" placeholder="Total..." />
                ) : (
                  <span>{t(props.totalLabel, locale)}</span>
                )}
                <span>{formatCommercePrice(total, currency)}</span>
              </div>
            </div>

            <Link href={`${localePrefix}/checkout`} className="btn-primary w-full text-center mt-6">
              {onSave && isEditable ? (
                <EditableText value={t(props.checkoutButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.checkoutButtonLabel', val)} isEditable={isEditable} tag="span" className="btn-primary w-full text-center mt-6" placeholder="Checkout..." />
              ) : (
                t(props.checkoutButtonLabel, locale)
              )}
            </Link>

            <Link href={`${localePrefix}/shop`} className="block text-center text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] mt-3">
              {onSave && isEditable ? (
                <EditableText value={t(props.continueShoppingLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.continueShoppingLabel', val)} isEditable={isEditable} tag="span" placeholder="Continue shopping..." />
              ) : (
                t(props.continueShoppingLabel, locale)
              )}
            </Link>

            <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
{onSave && isEditable ? (
                  <EditableText value={t(props.trustBadgeSecureLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.trustBadgeSecureLabel', val)} isEditable={isEditable} tag="span" placeholder="Secure label..." />
                ) : (
                  t(props.trustBadgeSecureLabel, locale)
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
{onSave && isEditable ? (
                  <EditableText value={t(props.trustBadgeReturnsLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.trustBadgeReturnsLabel', val)} isEditable={isEditable} tag="span" placeholder="Returns label..." />
                ) : (
                  t(props.trustBadgeReturnsLabel, locale)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
