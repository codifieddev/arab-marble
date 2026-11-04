'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface OrdersSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

const STATUS_MAP: Record<string, string> = {
  pending: 'statusPending',
  processing: 'statusProcessing',
  shipped: 'statusShipped',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
};

export default function OrdersSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: OrdersSectionProps) {
  const props = block.props || {};
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusLabel = (status: string) => {
    const key = STATUS_MAP[status] || 'statusPending';
    return t((props as any)[key], locale) || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom text-center py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-[var(--border)] rounded mx-auto" />
            <div className="h-4 w-64 bg-[var(--border)] rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
            <Link href={`${localePrefix}/`} className="hover:text-[var(--primary)]">
            {onSave && isEditable ? (
              <EditableText value={t(props.breadcrumbHomeLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbHomeLabel', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>Home</>
            )}
          </Link>
          <span>/</span>
          <Link href={`${localePrefix}/account`} className="hover:text-[var(--primary)]">
            {onSave && isEditable ? (
              <EditableText value={t(props.breadcrumbAccountLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbAccountLabel', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>Account</>
            )}
          </Link>
          <span>/</span>
          {onSave && isEditable ? (
            <EditableText value={t(props.breadcrumbLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text)]" />
          ) : (
            <span className="text-[var(--text)]">{t(props.breadcrumbLabel, locale)}</span>
          )}
        </div>

        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-[var(--border)] mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {onSave && isEditable ? (
            <EditableText value={t(props.emptyTitle, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyTitle', val)} isEditable={isEditable} tag="h2" className="text-2xl font-bold mb-3" placeholder="Empty title..." />
          ) : (
            <h2 className="text-2xl font-bold mb-3">{t(props.emptyTitle, locale)}</h2>
          )}
          {onSave && isEditable ? (
            <EditableText value={t(props.emptyDescription, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyDescription', val)} isEditable={isEditable} tag="p" className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto" placeholder="Empty description..." />
          ) : (
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">{t(props.emptyDescription, locale)}</p>
          )}
          <Link href={`${localePrefix}/shop`} className="btn-primary inline-flex items-center gap-2">
            {onSave && isEditable ? (
              <EditableText value={t(props.emptyCtaLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.emptyCtaLabel', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>{t(props.emptyCtaLabel, locale)}</>
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
              <>Home</>
            )}
          </Link>
          <span>/</span>
          <Link href={`${localePrefix}/account`} className="hover:text-[var(--primary)]">
            {onSave && isEditable ? (
              <EditableText value={t(props.breadcrumbAccountLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbAccountLabel', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>Account</>
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
          <EditableText value={t(props.heading, locale) || ''} onSave={(val) => onSave(block.id, 'props.heading', val)} isEditable={isEditable} tag="h1" className="text-3xl font-bold mb-8" placeholder="Heading..." />
        ) : (
          <h1 className="text-3xl font-bold mb-8">{t(props.heading, locale)}</h1>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                {onSave && isEditable ? (
                  <EditableText value={t(props.orderNumberLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderNumberLabel', val)} isEditable={isEditable} tag="th" className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]" />
                ) : (
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t(props.orderNumberLabel, locale)}</th>
                )}
                {onSave && isEditable ? (
                  <EditableText value={t(props.orderDateLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderDateLabel', val)} isEditable={isEditable} tag="th" className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]" />
                ) : (
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t(props.orderDateLabel, locale)}</th>
                )}
                {onSave && isEditable ? (
                  <EditableText value={t(props.orderStatusLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderStatusLabel', val)} isEditable={isEditable} tag="th" className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]" />
                ) : (
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t(props.orderStatusLabel, locale)}</th>
                )}
                {onSave && isEditable ? (
                  <EditableText value={t(props.orderTotalLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderTotalLabel', val)} isEditable={isEditable} tag="th" className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]" />
                ) : (
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t(props.orderTotalLabel, locale)}</th>
                )}
                {onSave && isEditable ? (
                  <EditableText value={t(props.orderItemsLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.orderItemsLabel', val)} isEditable={isEditable} tag="th" className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]" />
                ) : (
                  <th className="pb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t(props.orderItemsLabel, locale)}</th>
                )}
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-[var(--border)] hover:bg-[var(--accent-soft)] transition-colors">
                  <td className="py-4 text-sm font-medium">{order.orderNumber}</td>
                  <td className="py-4 text-sm text-[var(--text-secondary)]">{order.date}</td>
                  <td className="py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {onSave && isEditable ? (
                        <EditableText value={getStatusLabel(order.status)} onSave={(val) => onSave(block.id, `props.${STATUS_MAP[order.status] || 'statusPending'}`, val)} isEditable={isEditable} tag="span" className="" />
                      ) : (
                        <>{getStatusLabel(order.status)}</>
                      )}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-bold">${order.total.toFixed(2)}</td>
                  <td className="py-4 text-sm text-[var(--text-secondary)]">{order.items}</td>
                  <td className="py-4">
                    <Link
                      href={`${localePrefix}/account/orders/${order.id}`}
                      className="text-xs font-medium text-[var(--primary)] hover:underline"
                    >
                      {onSave && isEditable ? (
                        <EditableText value={t(props.viewDetailsLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.viewDetailsLabel', val)} isEditable={isEditable} tag="span" className="" />
                      ) : (
                        <>{t(props.viewDetailsLabel, locale)}</>
                      )}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
