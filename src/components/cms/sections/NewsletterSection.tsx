'use client';

import { useState } from 'react';
import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface NewsletterSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function NewsletterSection({ block, locale = 'en', isEditable = false, onSave }: NewsletterSectionProps) {
  const props = block.props || {};
  const [name, setName] = useState('');
  const [dogName, setDogName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const compiledForm =
    (block as any).compiledForm ||
    (block as any).referenced_forms?.[0] ||
    (props as any).compiledForm;

  const formSlug =
    compiledForm?.document_key ||
    compiledForm?.slug ||
    props.formSlug?.value?.[locale] ||
    props.formSlug?.value ||
    props.formSlug ||
    props.form?.slug ||
    'subscribtion-forms';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'peekeeper';
      await fetch(`/api/forms/public/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(formSlug)}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { email, name, dogName },
          context: {
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          },
        }),
      });
    } catch (err) {
      console.error('Newsletter submission error:', err);
    }
    setSubscribed(true);
    setName('');
    setDogName('');
    setEmail('');
  };

  return (
    <section className="nl-wrapper" style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'var(--background)' }}>
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(45,106,79,0.04)', top: -150, right: -100, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 250, height: 250, borderRadius: '50%',
        background: 'rgba(212,163,115,0.06)', bottom: -80, left: -60, pointerEvents: 'none',
      }} />
      <div className="container-custom nl-inner">
        <div>
          {onSave && isEditable ? (
            <EditableText
              value={t(props.heading, locale) || ''}
              onSave={(val) => onSave(block.id, 'props.heading', val)}
              isEditable={isEditable}
              tag="h2"
              className="section-title"
              placeholder="Heading..."
            />
          ) : (
            <h2 className="section-title">
              {t(props.heading, locale)}
            </h2>
          )}
          {onSave && isEditable ? (
            <EditableText
              value={t(props.subheading, locale) || ''}
              onSave={(val) => onSave(block.id, 'props.subheading', val)}
              isEditable={isEditable}
              tag="p"
              className="body-text"
              placeholder="Subheading..."
            />
          ) : (
            <p className="body-text" style={{ marginBottom: 20 }}>
              {t(props.subheading, locale)}
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {(Array.isArray(props.perks) ? props.perks : []).map((perk: string, i: number) => (
              <div key={i} className="small-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {onSave && isEditable ? (
                  <EditableText
                    value={t(perk, locale) || ''}
                    onSave={(val) => onSave(block.id, `props.perks.${i}`, val)}
                    isEditable={isEditable}
                    tag="span"
                    placeholder="Perk..."
                  />
                ) : (
                  t(perk, locale)
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          {subscribed ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <svg width="40" height="40" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <h3 className="card-title" style={{ marginTop: 14 }}>Welcome to the Family!</h3>
              <p className="body-text">Check your inbox for 10% off your first order.</p>
            </div>
          ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <style>{`@media (max-width:600px){.nl-form-grid{grid-template-columns:1fr!important}}`}</style>
                <div className="nl-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder={t(props.placeholderName, locale)} value={name}
                  onChange={e => setName(e.target.value)} required
                  className="form-input"
                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 'var(--radius-full)', padding: '13px 20px', color: 'var(--input-text)', fontSize: 14, fontWeight: 600, outline: 'none' }} />
                <input type="text" placeholder={t(props.placeholderDog, locale)} value={dogName}
                  onChange={e => setDogName(e.target.value)}
                  className="form-input"
                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 'var(--radius-full)', padding: '13px 20px', color: 'var(--input-text)', fontSize: 14, fontWeight: 600, outline: 'none' }} />
              </div>
              <input type="email" placeholder={t(props.placeholderEmail, locale)} value={email}
                onChange={e => setEmail(e.target.value)} required
                className="form-input"
                style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: 'var(--radius-full)', padding: '13px 20px', color: 'var(--input-text)', fontSize: 14, fontWeight: 600, outline: 'none' }} />
              <button
                type="submit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setIsPressed(false);
                }}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                style={{
                  background: isPressed 
                    ? 'var(--primary-dark)' 
                    : (isHovered ? 'var(--primary-light)' : 'var(--primary)'),
                  color: 'white', fontSize: 14, fontWeight: 800,
                  letterSpacing: '0.07em', textTransform: 'uppercase', padding: '14px 28px',
                  borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'background 0.28s, transform 0.28s, box-shadow 0.28s',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22l-4-9-9-4z" />
                </svg>
                {onSave && isEditable ? (
                  <EditableText
                    value={t(props.buttonText, locale) || ''}
                    onSave={(val) => onSave(block.id, 'props.buttonText', val)}
                    isEditable={isEditable}
                    tag="span"
                    placeholder="Button Text..."
                  />
                ) : t(props.buttonText, locale)}
              </button>
              {onSave && isEditable ? (
                <EditableText
                  value={t(props.disclaimer, locale) || ''}
                  onSave={(val) => onSave(block.id, 'props.disclaimer', val)}
                  isEditable={isEditable}
                  tag="p"
                  placeholder="Disclaimer..."
                />
              ) : (
                <p className="small-text" style={{ color: 'var(--text-muted)' }}>
                  {t(props.disclaimer, locale)}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
