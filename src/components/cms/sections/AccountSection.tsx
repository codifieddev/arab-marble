'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { loginThunk, registerThunk, logout } from '@/lib/store/auth/authSlice';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface AccountSectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function AccountSection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: AccountSectionProps) {
  const props = block.props || {};
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(s => s.auth);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      dispatch(registerThunk({ email, password, firstName, lastName, phone }));
    } else {
      dispatch(loginThunk({ email, password }));
    }
  };

  if (isAuthenticated && user) {
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
            {onSave && isEditable ? (
              <EditableText value={t(props.breadcrumbLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text)]" />
            ) : (
<span className="text-[var(--text)]">{t(props.breadcrumbLabel, locale)}</span>
            )}
          </div>

          {onSave && isEditable ? (
            <EditableText value={t(props.dashboardHeading, locale) || ''} onSave={(val) => onSave(block.id, 'props.dashboardHeading', val)} isEditable={isEditable} tag="h1" className="text-3xl font-bold mb-8" placeholder="Heading..." />
          ) : (
            <h1 className="text-3xl font-bold mb-8">{t(props.dashboardHeading, locale)}</h1>
          )}
          <p className="text-[var(--text-secondary)] mb-6">
            {onSave && isEditable ? (
              <EditableText value={t(props.signInHeading, locale) || ''} onSave={(val) => onSave(block.id, 'props.signInHeading', val)} isEditable={isEditable} tag="span" className="" />
            ) : (
              <>{t(props.signInHeading, locale)}</>
            )}, {user.firstName} {user.lastName}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
            <Link
              href={`${localePrefix}/account/orders`}
              className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--primary)] transition-colors"
            >
              <svg className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {onSave && isEditable ? (
                <EditableText value={t(props.menuMyOrdersLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.menuMyOrdersLabel', val)} isEditable={isEditable} tag="span" className="text-sm font-medium" />
              ) : (
                <span className="text-sm font-medium">{t(props.menuMyOrdersLabel, locale)}</span>
              )}
            </Link>
            <Link
              href={`${localePrefix}/account/profile`}
              className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--primary)] transition-colors"
            >
              <svg className="w-8 h-8 mx-auto mb-3 text-[var(--primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              {onSave && isEditable ? (
                <EditableText value={t(props.menuProfileLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.menuProfileLabel', val)} isEditable={isEditable} tag="span" className="text-sm font-medium" />
              ) : (
                <span className="text-sm font-medium">{t(props.menuProfileLabel, locale)}</span>
              )}
            </Link>
            <button
              onClick={() => dispatch(logout())}
              className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center hover:border-red-500 transition-colors cursor-pointer"
            >
              <svg className="w-8 h-8 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {onSave && isEditable ? (
                <EditableText value={t(props.menuLogoutLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.menuLogoutLabel', val)} isEditable={isEditable} tag="span" className="text-sm font-medium" />
              ) : (
                <span className="text-sm font-medium">{t(props.menuLogoutLabel, locale)}</span>
              )}
            </button>
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
          {onSave && isEditable ? (
            <EditableText value={t(props.breadcrumbLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.breadcrumbLabel', val)} isEditable={isEditable} tag="span" className="text-[var(--text)]" />
          ) : (
            <span className="text-[var(--text)]">{t(props.breadcrumbLabel, locale)}</span>
          )}
        </div>

        <div className="max-w-md mx-auto">
          {onSave && isEditable ? (
            <EditableText value={isRegister ? (t(props.createAccountHeading, locale) || '') : (t(props.signInHeading, locale) || '')} onSave={(val) => onSave(block.id, isRegister ? 'props.createAccountHeading' : 'props.signInHeading', val)} isEditable={isEditable} tag="h1" className="text-2xl font-bold text-center mb-8" placeholder="Heading..." />
          ) : (
            <h1 className="text-2xl font-bold text-center mb-8">
              {isRegister ? t(props.createAccountHeading, locale) : t(props.signInHeading, locale)}
            </h1>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-[var(--radius-md)] p-4 mb-6">
              {onSave && isEditable ? (
                <EditableText value={t(props.errorDisplay, locale) || ''} onSave={(val) => onSave(block.id, 'props.errorDisplay', val)} isEditable={isEditable} tag="span" className="" />
              ) : (
                <>{t(props.errorDisplay, locale)}</>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
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
                    <EditableText value={t(props.phoneLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.phoneLabel', val)} isEditable={isEditable} tag="label" className="block text-sm font-medium mb-1" />
                  ) : (
                    <label className="block text-sm font-medium mb-1">{t(props.phoneLabel, locale)}</label>
                  )}
                  <input className="form-input" placeholder={t(props.phonePlaceholder, locale)} value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </>
            )}
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
                <EditableText value={t(props.passwordLabel, locale) || ''} onSave={(val) => onSave(block.id, 'props.passwordLabel', val)} isEditable={isEditable} tag="label" className="block text-sm font-medium mb-1" />
              ) : (
                <label className="block text-sm font-medium mb-1">{t(props.passwordLabel, locale)}</label>
              )}
              <input className="form-input" type="password" placeholder={t(props.passwordPlaceholder, locale)} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {onSave && isEditable ? (
                <EditableText value={loading ? (t(props.loadingText, locale) || '') : (isRegister ? (t(props.createAccountButtonLabel, locale) || '') : (t(props.signInButtonLabel, locale) || ''))} onSave={(val) => onSave(block.id, loading ? 'props.loadingText' : (isRegister ? 'props.createAccountButtonLabel' : 'props.signInButtonLabel'), val)} isEditable={isEditable} tag="span" className="" />
              ) : (
                <>{loading ? t(props.loadingText, locale) : (isRegister ? t(props.createAccountButtonLabel, locale) : t(props.signInButtonLabel, locale))}</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            <button
              className="text-[var(--primary)] hover:underline cursor-pointer bg-transparent border-none"
              onClick={() => { setIsRegister(!isRegister); setEmail(''); setPassword(''); setFirstName(''); setLastName(''); setPhone(''); }}
            >
              {onSave && isEditable ? (
                <EditableText value={isRegister ? (t(props.toggleToLoginLabel, locale) || '') : (t(props.toggleToRegisterLabel, locale) || '')} onSave={(val) => onSave(block.id, isRegister ? 'props.toggleToLoginLabel' : 'props.toggleToRegisterLabel', val)} isEditable={isEditable} tag="span" className="" />
              ) : (
                <>{isRegister ? t(props.toggleToLoginLabel, locale) : t(props.toggleToRegisterLabel, locale)}</>
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
