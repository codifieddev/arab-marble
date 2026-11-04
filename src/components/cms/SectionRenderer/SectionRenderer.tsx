'use client';

import { BlockRenderer } from '../BlockRenderer/BlockRenderer';
import { isBlockReferenced } from '@/lib/cms/referenceGuard';

interface SectionRendererProps {
  section: any;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  isReferenced?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

export function SectionRenderer({ section, isReferenced: isReferencedProp, ...rest }: SectionRendererProps) {
  if (!section) return null;
  const isReferenced = isReferencedProp ?? isBlockReferenced(section);
  return <BlockRenderer block={section} isReferenced={isReferenced} {...rest} />;
}

