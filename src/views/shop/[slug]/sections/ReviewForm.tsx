'use client';

import React, { RefObject } from 'react';

interface ReviewFormState {
  title: string;
  text: string;
  name: string;
  email: string;
  stars: number;
}

export default function ReviewForm({
  reviewForm, onFormChange, onSubmit, hoveredStars, onHoveredStarsChange, fileInputRef, locale = 'en', cmsProps
}: {
  reviewForm: ReviewFormState;
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  hoveredStars: number | null;
  onHoveredStarsChange: (val: number | null) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  locale?: string;
  cmsProps?: any;
}) {
  const heading = cmsProps?.reviews?.shareExperience?.[locale] || (locale === 'hi' ? 'अपना अनुभव साझा करें' : 'Share Your Experience');
  const subtitle = cmsProps?.reviews?.formSubtitle?.[locale] || (locale === 'hi' ? 'आपका ईमेल पता प्रकाशित नहीं किया जाएगा। आवश्यक फ़ील्ड * से चिह्नित हैं' : 'Your email address will not be published. Required fields are marked *');
  const titleLabel = cmsProps?.reviews?.reviewTitleLabel?.[locale] || (locale === 'hi' ? 'समीक्षा शीर्षक *' : 'Review Title *');
  const textLabel = cmsProps?.reviews?.reviewTextLabel?.[locale] || (locale === 'hi' ? 'आपकी समीक्षा *' : 'Your Review *');
  const nameLabel = cmsProps?.reviews?.nameLabel?.[locale] || (locale === 'hi' ? 'आपका नाम *' : 'Your Name *');
  const emailLabel = cmsProps?.reviews?.emailLabel?.[locale] || (locale === 'hi' ? 'आपका ईमेल *' : 'Your Email *');
  const ratingLabel = cmsProps?.reviews?.ratingLabel?.[locale] || (locale === 'hi' ? 'आपकी रेटिंग *' : 'Your Rating *');
  const submitBtn = cmsProps?.reviews?.submitButton?.[locale] || (locale === 'hi' ? 'समीक्षा सबमिट करें' : 'Submit Review');

  return (
    <section id="review-form" className="section-padding pt-0 pb-16">
      <div className="container-custom max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="sec-title text-4xl font-bold">{heading}</h2>
          <p className="sec-sub mt-3 text-[var(--text-secondary)]">{subtitle}</p>
        </div>

        <div className="card-theme p-8 md:p-12 shadow-xl border border-[var(--border)] rounded-[var(--radius-2xl)] bg-[var(--white)] text-left">
          <form onSubmit={onSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">{titleLabel}</label>
              <input
                required
                className="w-full rounded-full border border-[var(--border)] px-6 py-4 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition-colors bg-[var(--surface)] text-[var(--text)]"
                placeholder={titleLabel.replace(' *', '')}
                value={reviewForm.title}
                onChange={(e) => onFormChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">{textLabel}</label>
              <textarea
                required
                rows={5}
                className="w-full rounded-[var(--radius-xl)] border border-[var(--border)] p-6 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition-colors bg-[var(--surface)] text-[var(--text)]"
                placeholder={textLabel.replace(' *', '')}
                value={reviewForm.text}
                onChange={(e) => onFormChange('text', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">{nameLabel}</label>
                <input
                  required
                  className="w-full rounded-full border border-[var(--border)] px-6 py-4 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition-colors bg-[var(--surface)] text-[var(--text)]"
                  placeholder={nameLabel.replace(' *', '')}
                  value={reviewForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">{emailLabel}</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-full border border-[var(--border)] px-6 py-4 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition-colors bg-[var(--surface)] text-[var(--text)]"
                  placeholder={emailLabel.replace(' *', '')}
                  value={reviewForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.06em] text-[var(--text-muted)] mb-2">{ratingLabel}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="p-1 cursor-pointer focus:outline-none"
                    onMouseEnter={() => onHoveredStarsChange(s)}
                    onMouseLeave={() => onHoveredStarsChange(null)}
                    onClick={() => onFormChange('stars', s)}
                    aria-label={`${s} Stars`}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill={(hoveredStars !== null ? s <= hoveredStars : s <= reviewForm.stars) ? '#F7B500' : 'none'}
                      stroke={(hoveredStars !== null ? s <= hoveredStars : s <= reviewForm.stars) ? '#F7B500' : '#D1D5DB'}
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-5 text-sm uppercase tracking-widest font-extrabold shadow-lg rounded-full"
            >
              {submitBtn}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
