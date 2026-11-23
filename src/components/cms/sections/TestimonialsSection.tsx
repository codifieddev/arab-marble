'use client';

import type { PageBlock } from '@/lib/store/pages/pageType';

interface TestimonialsSectionProps {
  block?: PageBlock;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  isReferenced?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export default function TestimonialsSection(_props: TestimonialsSectionProps) {
  // Testimonials section is hidden from rendering
  return null;
}
