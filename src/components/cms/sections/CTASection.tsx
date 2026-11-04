'use client';

import Link from 'next/link';
import type { PageBlock } from '@/lib/store/pages/pageType';
import { t } from '@/lib/i18n';
import EditableText from '@/components/shared/EditableText';
import { motion } from 'motion/react';

const decorativeShapes = [
  { size: 20, x: '10%', y: '20%', color: 'var(--primary)', delay: 0, animation: 'float' as const },
  { size: 14, x: '85%', y: '30%', color: 'var(--secondary)', delay: 0.5, animation: 'pulse' as const },
  { size: 10, x: '20%', y: '75%', color: 'var(--accent)', delay: 1, animation: 'float' as const },
  { size: 16, x: '75%', y: '70%', color: 'var(--accent)', delay: 1.5, animation: 'bounce' as const },
];

interface CTASectionProps {
  block: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

function extractSafeHref(val: any, fallback = '/shop'): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val.value && typeof val.value === 'string') return val.value;
    if (val.href) return extractSafeHref(val.href, fallback);
    if (val.url && typeof val.url === 'string') return val.url;
    if (val.path && typeof val.path === 'string') return val.path;
    if (val.en && typeof val.en === 'string') return val.en;
    const strVal = Object.values(val).find((v) => typeof v === 'string');
    if (strVal) return strVal as string;
  }
  return fallback;
}

export default function CTASection({ block, locale = 'en', localePrefix = '', isEditable = false, onSave }: CTASectionProps) {
  const title = block.props?.title;
  const subtitle = block.props?.subtitle;
  const buttonText = block.props?.buttonText;
  const rawButtonLink = extractSafeHref(block.props?.buttonLink, '/shop');
  const safeButtonLink = rawButtonLink.startsWith('/') ? `${localePrefix}${rawButtonLink}` : rawButtonLink;

  if (!title && !subtitle) return null;

  return (
    <div className="section-padding" style={{ background: 'linear-gradient(135deg, var(--background) 0%, var(--accent-soft) 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative floating shapes */}
      {decorativeShapes.map((shape, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={shape.animation === 'float'
            ? { y: [0, -12, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: shape.delay } }
            : shape.animation === 'pulse'
            ? { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: shape.delay } }
            : { y: [0, -16, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: shape.delay } }
          }
          style={{
            position: 'absolute',
            left: shape.x,
            top: shape.y,
            width: shape.size,
            height: shape.size,
            borderRadius: '50%',
            background: shape.color,
            opacity: 0.25,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
      <div className="container-custom text-center" style={{ position: 'relative', zIndex: 1 }}>
        {title && (onSave && isEditable ? (
          <EditableText
            value={t(title, locale)}
            onSave={(val) => onSave(block.id, 'props.title', val)}
            isEditable={isEditable}
            tag="h2"
            className="section-title"
            placeholder="Title..."
          />
        ) : (
          <h2 className="section-title" dangerouslySetInnerHTML={{ __html: t(title, locale) }} />
        ))}
        {subtitle && (onSave && isEditable ? (
          <EditableText
            value={t(subtitle, locale)}
            onSave={(val) => onSave(block.id, 'props.subtitle', val)}
            isEditable={isEditable}
            tag="p"
            className="text-[var(--text-secondary)] mt-3 max-w-xl mx-auto"
            placeholder="Subtitle..."
          />
        ) : (
          <p className="text-[var(--text-secondary)] mt-4 max-w-xl mx-auto text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: t(subtitle, locale) }} />
        ))}
        {buttonText && (
          <Link href={safeButtonLink} className="btn-primary mt-8 inline-block" style={{paddingLeft:"34px", paddingRight:"34px"}}>
            {onSave && isEditable ? (
              <EditableText
                value={t(buttonText, locale)}
                onSave={(val) => onSave(block.id, 'props.buttonText', val)}
                isEditable={isEditable}
                tag="span"
                className=""
                placeholder="Button Text..."
              />
            ) : (
              <>{t(buttonText, locale)}</>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
