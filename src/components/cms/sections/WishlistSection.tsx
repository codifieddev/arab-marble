'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PageBlock } from '@/lib/store/pages/pageType';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { addToCartAsync, openCartDrawer } from '@/lib/store/cart/cartSlice';
import { fetchCommerceProduct, formatCommercePrice, getCommerceId, resolveCommercePrice, resolveProductImage } from '@/lib/commerce/product-normalization';
import { updateWishlistThunk } from '@/lib/store/auth/authThunks';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import { getEntityUrl } from '@/lib/permalink/url-helper';

type WishlistProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  currency: string;
};

interface WishlistSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function WishlistSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: WishlistSectionProps) {
  const props = block.props || {};
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loadedWishlistKey, setLoadedWishlistKey] = useState('');
  const wishlistIds = user?.wishlist || [];
  const wishlistKey = JSON.stringify(wishlistIds);
  const loading = isAuthenticated
    && wishlistIds.length > 0
    && loadedWishlistKey !== wishlistKey;
  const visibleItems = isAuthenticated
    ? items.filter((item) => wishlistIds.includes(item.id))
    : [];

  useEffect(() => {
    let cancelled = false;
    const requestedIds = JSON.parse(wishlistKey) as string[];
    if (!isAuthenticated || requestedIds.length === 0) {
      return;
    }

    Promise.all(
      requestedIds.map((productId) =>
        fetchCommerceProduct(productId).catch(() => null),
      ),
    )
      .then((products) => {
        if (cancelled) return;
        setItems(
          products.flatMap((product) => {
            if (!product) return [];
            const id = getCommerceId(product);
            if (!id) return [];
            return [{
              id,
              slug: String(product.slug || id),
              name: String(product.name || product.title || 'Product'),
              image: resolveProductImage(product, '/placeholder.png'),
              price: resolveCommercePrice(product),
              currency: String(product.currency || product.pricing?.currency || 'USD'),
            }];
          }),
        );
        setLoadedWishlistKey(wishlistKey);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, wishlistKey]);

  const handleRemove = async (productId: string) => {
    try {
      await dispatch(updateWishlistThunk({ productId, add: false })).unwrap();
      setItems((current) => current.filter((item) => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update wishlist');
    }
  };

  if (loading && isAuthenticated && wishlistIds.length > 0) {
    return (
      <div className="section-padding">
        <div className="container-custom py-20 text-center text-[var(--text-secondary)]">Loading wishlist...</div>
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-[var(--border)] mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {onSave && isEditable ? (
              <EditableText value={t(props.emptyTitle, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyTitle', val)} isEditable={isEditable} tag="h2" className="section-title" placeholder="Empty title..." />
            ) : (
              <h2 className="section-title">{isAuthenticated ? t(props.emptyTitle, locale) : (t(props.loginPrompt, locale) || (locale === 'hi' ? 'अपनी विशलिस्ट देखने के लिए लॉग इन करें' : 'Log in to view your wishlist'))}</h2>
            )}
            {onSave && isEditable ? (
              <EditableText value={t(props.emptyDescription, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyDescription', val)} isEditable={isEditable} tag="p" className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto" placeholder="Empty description..." />
            ) : (
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{isAuthenticated ? t(props.emptyDescription, locale) : (t(props.loginDescription, locale) || (locale === 'hi' ? 'आपके सहेजे गए उत्पाद आपके खाते से सुरक्षित रूप से सिंक होते हैं।' : 'Your saved products are securely synced with your account.'))}</p>
            )}
            <Link href={isAuthenticated ? `${localePrefix}/shop` : `${localePrefix}/login?returnTo=${encodeURIComponent(`${localePrefix}/wishlist`)}`} className="btn-primary inline-flex items-center gap-2">
              {onSave && isEditable ? (
                <EditableText value={t(props.emptyCtaLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyCtaLabel', val)} isEditable={isEditable} tag="span" className="" />
              ) : (
                <>{isAuthenticated ? t(props.emptyCtaLabel, locale) : (locale === 'hi' ? 'लॉग इन करें' : 'Log in')}</>
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          <Link href={`${localePrefix}/`} className="hover:text-[var(--primary)]">
            {onSave && isEditable ? (
              <EditableText value={t(props.breadcrumbHomeLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbHomeLabel', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>{t(props.breadcrumbHomeLabel, locale) || (locale === 'hi' ? 'होम' : 'Home')}</>
            )}
          </Link>
          <span>/</span>
          {onSave && isEditable ? (
            <EditableText value={t(props.breadcrumbLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text)]" />
          ) : (
            <span className="text-[var(--text)]">{t(props.breadcrumbLabel, locale)}</span>
          )}
        </div>

        {onSave && isEditable ? (
          <EditableText value={t(props.heading, locale) || ''} onSave={(val) => onSave(block.id, 'props.heading', val)} isEditable={isEditable} tag="h1" className="section-title" placeholder="Heading..." />
        ) : (
          <h1 className="section-title">{t(props.heading, locale)}</h1>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleItems.map(item => (
            <div key={item.id} className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden group">
              <Link href={getEntityUrl({ type: 'product', slug: item.slug, id: item.id }, locale)} className="block relative aspect-[4/5] bg-[var(--background)] overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-contain object-center transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              </Link>
              <div className="p-4">
                <Link href={getEntityUrl({ type: 'product', slug: item.slug, id: item.id }, locale)}>
                  <h3 className="card-title hover:text-[var(--primary)] transition-colors">{item.name}</h3>
                </Link>
                <p className="price-sm mt-1">{t(props.priceLabel, locale)}: {formatCommercePrice(item.price, item.currency)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn-primary flex-1 text-xs py-2"
                    onClick={async () => {
                      await dispatch(addToCartAsync({ productId: item.id, quantity: 1 })).unwrap();
                      dispatch(openCartDrawer());
                    }}
                  >
                    {onSave && isEditable ? (
                      <EditableText value={t(props.addToCartButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.addToCartButtonLabel', val)} isEditable={isEditable} tag="span" className="" />
                    ) : (
                      <>{t(props.addToCartButtonLabel, locale)}</>
                    )}
                  </button>
                  <button
                    className="btn-outline text-xs py-2 px-3"
                    onClick={() => handleRemove(item.id)}
                  >
                    {onSave && isEditable ? (
                      <EditableText value={t(props.removeButtonLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.removeButtonLabel', val)} isEditable={isEditable} tag="span" className="" />
                    ) : (
                      <>{t(props.removeButtonLabel, locale)}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
