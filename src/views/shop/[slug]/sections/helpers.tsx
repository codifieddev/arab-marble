'use client';

import Image from 'next/image';
import type { Review } from '@/lib/peekeeper-shop-data';
import { ReferenceEditButton } from '@/components/cms/reference-editor';

export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="inline-flex gap-1.5 items-center leading-none" aria-label={`${value} stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(value);
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#F7B500' : 'none'} stroke={filled ? '#F7B500' : '#E8E0DD'} strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
        );
      })}
    </div>
  );
}

export function ThumbUpIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

export function ThumbDownIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

export function HeartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function ReviewCard({
  review, vote, onVote, onImageClick, onSave
}: {
  review: Review;
  vote: 'helpful' | 'like' | 'dislike' | null;
  onVote: (id: string, type: 'helpful' | 'like' | 'dislike') => void;
  onImageClick?: (image: string) => void;
  onSave?: (updatedData: any) => void;
}) {
  return (
    <article className="card-theme overflow-hidden rounded-2xl flex flex-col justify-between h-full w-full text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="font-semibold text-[var(--text)] text-sm">
            {review.name}
            {review.verified && <span className="ml-2 text-[10px] text-[var(--success)] uppercase tracking-[0.08em]">✓ Verified</span>}
          </div>
          <div className="flex items-center gap-2">
            <ReferenceEditButton
              type="review"
              title={`Edit Review by ${review.name}`}
              data={{ ...review, author: review.name, review: review.text }}
              onSave={onSave}
              compact
            />
            <div className="text-xs italic text-[var(--text-muted)] shrink-0">{review.date}</div>
          </div>
        </div>
        <StarRating value={review.stars} size={14} />
        <h3 className="card-title mt-3 mb-2 text-lg font-bold">{review.title}</h3>
        <p className="body-text">{review.text}</p>
        {review.image && (
          <div
            className="relative mt-4 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => onImageClick?.(review.image!)}
            role="button"
            tabIndex={0}
            aria-label="View full size image"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onImageClick?.(review.image!); } }}
          >
            <Image src={review.image} alt={review.title} width={720} height={540} className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105" unoptimized />
            {review.withImages && (
              <div className="absolute right-3 bottom-3 w-7 h-7 rounded-full bg-[var(--primary-dark)] text-white flex items-center justify-center text-xs font-bold">+2</div>
            )}
          </div>
        )}
        {review.reply && (
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <div className="font-semibold text-sm text-[var(--text)]">Reply from A*** P******:</div>
            <p className="body-text mt-1">{review.reply}</p>
          </div>
        )}
      </div>
      <div className="border-t border-[var(--border)] px-5 py-3 flex items-center justify-end gap-4 text-sm text-[var(--text)] mt-auto bg-[var(--surface)]">
        <span className="text-[var(--text-muted)] text-xs">Helpful?</span>
        <button
          type="button"
          onClick={() => onVote(review.id, 'helpful')}
          disabled={vote !== null && vote !== 'helpful'}
          className={`inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 bg-transparent border-0 p-0 text-sm ${vote === 'helpful' ? 'text-[var(--primary)] font-bold' : 'text-[var(--text)] hover:text-[var(--primary)]'}`}
          aria-label={vote === 'helpful' ? 'Marked as helpful' : 'Mark as helpful'}
        >
          <HeartIcon active={vote === 'helpful'} />
          {review.helpful}
        </button>
        <button
          type="button"
          onClick={() => onVote(review.id, 'like')}
          disabled={vote !== null && vote !== 'like'}
          className={`inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 bg-transparent border-0 p-0 text-sm ${vote === 'like' ? 'text-[var(--primary)] font-bold' : 'text-[var(--text)] hover:text-[var(--primary)]'}`}
          aria-label={vote === 'like' ? 'Liked' : 'Like'}
        >
          <ThumbUpIcon active={vote === 'like'} />
        </button>
        <button
          type="button"
          onClick={() => onVote(review.id, 'dislike')}
          disabled={vote !== null && vote !== 'dislike'}
          className={`inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 bg-transparent border-0 p-0 text-sm ${vote === 'dislike' ? 'text-[var(--error)] font-bold' : 'text-[var(--text)] hover:text-[var(--error)]'}`}
          aria-label={vote === 'dislike' ? 'Disliked' : 'Dislike'}
        >
          <ThumbDownIcon active={vote === 'dislike'} />
          {review.notHelpful}
        </button>
      </div>
    </article>
  );
}
