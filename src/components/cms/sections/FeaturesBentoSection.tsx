'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { AnimatedIcon } from '@/components/shared/AnimatedIcon';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeInView';
import { t } from '@/lib/i18n';

interface FeaturesBentoSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function FeaturesBentoSection({ block, locale = 'en', isEditable = false, onSave }: FeaturesBentoSectionProps) {
  const props = block.props || {};
  const items = Array.isArray(props.items) ? props.items : [];

  const iconMap: Record<string, React.ReactNode> = {
    shield: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    box: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
    globe: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72" /><path d="M10.5 21.39a10.9 10.9 0 0 1-8.5-8.5" /></svg>,
    'credit-card': <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  };

  const iconColors: Record<string, string> = {
    rose: 'var(--primary)', sage: 'var(--secondary)', lav: 'var(--accent)',
  };

  const iconBgColors: Record<string, string> = {
    rose: 'rgba(217,84,122,0.1)',
    sage: 'rgba(139,175,133,0.15)',
    lav: 'rgba(196,181,212,0.2)',
  };

  const animations = ['float', 'pulse', 'bounce', 'glow', 'spin'] as const;

  if (!items.length) return null;

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'var(--white)' }}>
      <div className="container-custom">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          {onSave && isEditable ? (
            <EditableText
              value={t(props.tag, locale) || ''}
              onSave={(val) => onSave(block.id, 'props.tag', val)}
              isEditable={isEditable}
              tag="div"
              className="sec-tag"
              placeholder="Tag..."
            />
          ) : (
            <div className="sec-tag">{t(props.tag, locale)}</div>
          )}
          {onSave && isEditable ? (
            <EditableText
              value={t(props.heading, locale) || ''}
              onSave={(val) => onSave(block.id, 'props.heading', val)}
              isEditable={isEditable}
              tag="h2"
              className="sec-title"
              placeholder="Heading..."
            />
          ) : (
            <h2 className="sec-title" dangerouslySetInnerHTML={{ __html: t(props.heading, locale) }} />
          )}
        </div>
        <FadeInStagger className="features-bento">
          {items.map((item: any, i: number) => {
            const isLarge = item.layout === 'large';
            const iconColor = iconColors[item.iconColor] || 'var(--primary)';
            const iconBg = iconBgColors[item.iconColor] || 'rgba(217,84,122,0.1)';

            return (
              <FadeInItem
                key={item.id || i}
                className={`${isLarge ? 'feature-card-large' : ''} feature-card-hover`}
                style={{
                  background: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 30px',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.28s, box-shadow 0.28s',
                }}
              >
                {isLarge && item.image && (
                  <img src={item.image} alt="" style={{
                    width: 'clamp(140px, 30vw, 220px)', height: 'clamp(120px, 28vw, 200px)', objectFit: 'cover',
                    borderRadius: 'var(--radius-md)', flexShrink: 0,
                  }} />
                )}
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <AnimatedIcon
                      animation={animations[i % animations.length]}
                      delay={i * 0.1}
                      size={52}
                      color={iconColor}
                      bgColor={iconBg}
                    >
                      {iconMap[item.icon] || iconMap.shield}
                    </AnimatedIcon>
                  </div>
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(item.title, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.items.${i}.title`, val)}
                      isEditable={isEditable}
                      tag="h3"
                      className=""
                      placeholder="Feature Title..."
                    />
                  ) : (
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--text)', marginBottom: 10 }}>{t(item.title, locale)}</h3>
                  )}
                  {onSave && isEditable ? (
                    <EditableText
                      value={t(item.description, locale) || ''}
                      onSave={(val) => onSave(block.id, `props.items.${i}.description`, val)}
                      isEditable={isEditable}
                      tag="p"
                      className=""
                      placeholder="Feature Description..."
                    />
                  ) : (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t(item.description, locale)}</p>
                  )}
                  {item.linkText && (
                    <a href={item.linkHref} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginTop: 14,
                    }}>
                      {onSave && isEditable ? (
                        <EditableText
                          value={t(item.linkText, locale) || ''}
                          onSave={(val) => onSave(block.id, `props.items.${i}.linkText`, val)}
                          isEditable={isEditable}
                          tag="span"
                          className=""
                          placeholder="Link Text..."
                        />
                      ) : (
                        <>{t(item.linkText, locale)}</>
                      )}
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </FadeInItem>
            );
          })}
        </FadeInStagger>
      </div>
    </section>
  );
}
