'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';
import EditableText from '@/components/shared/EditableText';
import { t } from '@/lib/i18n';

interface PressSectionProps {
  block: PageBlock;
  locale?: string;
  isEditable?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function PressSection({ block, locale = 'en', isEditable = false, onSave }: PressSectionProps) {
  const props = block.props || {};
  const logos = Array.isArray(props.logos) ? props.logos : [];

  if (!logos.length) return null;

  const renderMagazineCard = (logo: any, idx: number) => (
    <div key={idx} style={{
      width: 'clamp(160px, 42vw, 240px)',
      height: 'clamp(220px, 55vw, 340px)',
      maxWidth: '100%',
      background: 'white',
      border: '12px solid white',
      boxShadow: '0 15px 35px rgba(217, 84, 122, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.28s, box-shadow 0.28s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(217, 84, 122, 0.7)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 15px 35px rgba(217, 84, 122, 0.55)';
    }}>
      <img 
        src={logo.src} 
        alt={t(logo.alt, locale)} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }} 
      />
    </div>
  );

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 0', background: 'white' }}>
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
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(24px, 5vw, 48px)',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 'clamp(24px, 6vw, 48px)',
        }}>
          {/* Row 1: 4 items */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'clamp(24px, 5vw, 48px)',
            width: '100%',
          }}>
            {logos.slice(0, 4).map((logo: any, i: number) => renderMagazineCard(logo, i))}
          </div>

          {/* Row 2: 3 items */}
          {logos.length > 4 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 'clamp(24px, 5vw, 48px)',
              width: '100%',
            }}>
              {logos.slice(4, 7).map((logo: any, i: number) => renderMagazineCard(logo, i + 4))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
