'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import { useAppSelector } from '@/lib/store/hooks';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface ProfileSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function ProfileSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: ProfileSectionProps) {
  const props = block.props || {};
  const user = useAppSelector(s => s.auth.user);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(false);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

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
              <>{t(props.breadcrumbAccountLabel, locale)}</>
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

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-[var(--radius-md)] p-4 mb-6">
            {onSave && isEditable ? (
              <EditableText value={t(props.successMessage, locale) || ''} onSave={(val) => onSave(block.id, 'props.successMessage', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>{t(props.successMessage, locale)}</>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-[var(--radius-md)] p-4 mb-6">
            {onSave && isEditable ? (
              <EditableText value={t(props.errorMessage, locale) || ''} onSave={(val) => onSave(block.id, 'props.errorMessage', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>{t(props.errorMessage, locale)}</>
            )}
          </div>
        )}

        <form onSubmit={handleSave} className="max-w-md space-y-4">
          <div>
            {onSave && isEditable ? (
              <EditableText value={t(props.firstNameLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.firstNameLabel', val)} isEditable={isEditable} tag="label" className="block text-sm font-medium mb-1" />
            ) : (
              <label className="block text-sm font-medium mb-1">{t(props.firstNameLabel, locale)}</label>
            )}
            <input className="form-input" placeholder={t(props.firstNamePlaceholder, locale)} value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div>
            {onSave && isEditable ? (
              <EditableText value={t(props.lastNameLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.lastNameLabel', val)} isEditable={isEditable} tag="label" className="block text-sm font-medium mb-1" />
            ) : (
              <label className="block text-sm font-medium mb-1">{t(props.lastNameLabel, locale)}</label>
            )}
            <input className="form-input" placeholder={t(props.lastNamePlaceholder, locale)} value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
          <div>
            {onSave && isEditable ? (
              <EditableText value={t(props.emailLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.emailLabel', val)} isEditable={isEditable} tag="label" className="block text-sm font-medium mb-1" />
            ) : (
              <label className="block text-sm font-medium mb-1">{t(props.emailLabel, locale)}</label>
            )}
            <input className="form-input" type="email" placeholder={t(props.emailPlaceholder, locale)} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            {onSave && isEditable ? (
              <EditableText value={t(props.phoneLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.phoneLabel', val)} isEditable={isEditable} tag="label" className="block text-sm font-medium mb-1" />
            ) : (
              <label className="block text-sm font-medium mb-1">{t(props.phoneLabel, locale)}</label>
            )}
            <input className="form-input" placeholder={t(props.phonePlaceholder, locale)} value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {onSave && isEditable ? (
              <EditableText value={saving ? (t(props.savingText, locale) || '') : (t(props.saveButtonLabel, locale) || '')} onSave={(val) => onSave(block.id, saving ? 'props.savingText' : 'props.saveButtonLabel', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>{saving ? t(props.savingText, locale) : t(props.saveButtonLabel, locale)}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
