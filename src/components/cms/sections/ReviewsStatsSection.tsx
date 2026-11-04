'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';

interface ReviewsStatsSectionProps {
  block: PageBlock;
}

function Star({ filled, half }: { filled?: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="#F4B740" />
            <stop offset="50%" stopColor="#E2E2E8" />
          </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#halfGrad)" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? '#F4B740' : '#E2E2E8'} />
    </svg>
  );
}

function renderStars(rating: number, max: number = 5) {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const rounded = rating - full >= 0.75 ? full + 1 : full;
  for (let i = 0; i < max; i++) {
    if (i < rounded) {
      stars.push(<Star key={i} filled />);
    } else if (i === full && hasHalf) {
      stars.push(<Star key={i} half />);
    } else {
      stars.push(<Star key={i} />);
    }
  }
  return stars;
}

export default function ReviewsStatsSection({ block }: ReviewsStatsSectionProps) {
  const props = block.props || {};
  const breakdown = Array.isArray(props.ratingBreakdown) ? props.ratingBreakdown : [];

  return (
    <section style={{ padding: 'clamp(40px, 7vw, 60px) 0', background: 'var(--background)' }}>
      <style>{`@media (max-width:768px){.rs-grid{grid-template-columns:1fr!important;gap:24px!important;padding:24px 20px!important}}`}</style>
      <div className="container-custom">
        <div className="rs-grid" style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 48,
          alignItems: 'start',
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 48px)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(36px, 8vw, 56px)',
              color: 'var(--text)',
              lineHeight: 1,
              marginBottom: 8,
            }}>{props.rating?.toFixed(2) || '0.00'}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 8 }}>
              {renderStars(props.rating || 0, props.maxRating || 5)}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}>
              {props.totalRatings || 0} ratings &middot; {props.totalReviews || 0} reviews
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {breakdown.map((row: any, i: number) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  minWidth: 30,
                  textAlign: 'right',
                }}>{row.stars}★</span>
                <div style={{
                  flex: 1,
                  height: 10,
                  background: 'var(--border)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${row.percentage}%`,
                    height: '100%',
                    background: '#F4B740',
                    borderRadius: 999,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  minWidth: 40,
                }}>{row.count || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
