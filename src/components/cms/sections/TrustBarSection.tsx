'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { AnimatedIcon } from '@/components/shared/AnimatedIcon';
import { t } from '@/lib/i18n';

interface TrustBarSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const iconSvgs: Record<string, React.ReactNode> = {
  card: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="22" height="18" rx="2" /><path d="m1 9h22" /></svg>,
  shield: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  globe: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" /></svg>,
  phone: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.7a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
};

const animations = ['float', 'pulse', 'bounce', 'float'] as const;

export default function TrustBarSection({ block, locale = 'en', isEditable = false, onSave }: TrustBarSectionProps) {
  const rawItems = block.props?.items;
  const items = Array.isArray(rawItems) ? rawItems : (rawItems && typeof rawItems === 'object' && 'value' in rawItems ? (typeof rawItems.value === 'string' ? JSON.parse(rawItems.value) : rawItems.value) : []);
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) return null;

  return (
    <section style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <style>{`@media (max-width:640px){.tb-item{border-right:none!important;padding:16px 18px!important}}`}</style>
      <div className="trust-grid-4" style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
        {safeItems.map((item: any, i: number) => (
          <div key={i} className="tb-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: 'clamp(16px, 2.5vw, 24px) clamp(14px, 2vw, 24px)',
            borderRight: i < safeItems.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <AnimatedIcon
              animation={animations[i % animations.length]}
              delay={i * 0.1}
              duration={3 + i * 0.5}
              color="var(--primary)"
              bgColor="linear-gradient(135deg, var(--accent-soft), var(--background))"
              size={46}
            >
              {iconSvgs[item.icon] || iconSvgs.card}
            </AnimatedIcon>
            <div>
              {onSave && isEditable ? (
                <EditableText
                  value={t(item.title, locale) || ''}
                  onSave={(val) => onSave(block.id, `props.items.${i}.title`, val)}
                  isEditable={isEditable}
                  tag="h4"
                  placeholder="Title..."
                />
              ) : (
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{t(item.title, locale)}</h4>
              )}
              {onSave && isEditable ? (
                <EditableText
                  value={t(item.description, locale) || ''}
                  onSave={(val) => onSave(block.id, `props.items.${i}.description`, val)}
                  isEditable={isEditable}
                  tag="p"
                  placeholder="Description..."
                />
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t(item.description, locale)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
