'use client';

import { blockRegistry } from '@/lib/registry';
import JinjaSectionRenderer from '@/components/sections/JinjaSectionRenderer';
import TextSection from '@/components/cms/sections/TextSection';
import { isBlockReferenced } from '@/lib/cms/referenceGuard';

interface BlockRendererProps {
  block: any;
  locale?: string;
  localePrefix?: string;
  isEditable?: boolean;
  isReferenced?: boolean;
  onSave?: (sectionId: string, fieldPath: string, value: string) => void;
}

const TYPE_ALIASES: Record<string, string> = {
  'hero.split': 'hero',
  'story.feature': 'about-story',
  'rich-text': 'text',
  'policy.content': 'text',
  'contact.details': 'contact-form',
  'contact-details': 'contact-form',
  'faq.accordion': 'faq-accordion',
  'product.grid': 'product-grid',
};

export function BlockRenderer({ block, isReferenced: isReferencedProp, ...rest }: BlockRendererProps) {
  if (!block) return null;
  const isReferenced = isReferencedProp ?? isBlockReferenced(block);


  // Direct check for Jinja template / custom Jinja components
  if (
    block.html ||
    block.templateHtml ||
    block.type === 'jinja-component' ||
    block.type === 'jinja-features' ||
    block.type === 'jinja-template' ||
    block.type?.startsWith('jinja') ||
    block.type === 'component' ||
    block.type?.startsWith('type-component')
  ) {
    return <JinjaSectionRenderer section={block} lang={rest.locale || 'en'} />;
  }

  // Normalize block properties (merge Kalp CMS `content` schema into `props` if empty)
  const contentObj = block.content && typeof block.content === 'object' ? block.content : {};
  const propsObj = block.props && typeof block.props === 'object' ? block.props : {};

  const normalizedBlock = {
    ...block,
    props: {
      heading: propsObj.heading || contentObj.heading || contentObj.title,
      content: propsObj.content || contentObj.body || contentObj.description,
      eyebrow: propsObj.eyebrow || contentObj.eyebrow,
      tag: propsObj.tag || contentObj.eyebrow,
      image: propsObj.image || contentObj.image,
      cta: propsObj.cta || (contentObj.ctaLabel ? { label: contentObj.ctaLabel, href: contentObj.ctaHref || '/shop' } : undefined),
      paragraphs: propsObj.paragraphs || (typeof contentObj.body === 'string' ? contentObj.body.split(/\n\n+/) : undefined),
      ...propsObj,
    },
  };

  const resolvedType = TYPE_ALIASES[block.type] || block.type;
  const Component = blockRegistry[block.type] || blockRegistry[resolvedType];

  if (!Component) {
    // If block has any text content, fall back gracefully to TextSection
    if (normalizedBlock.props?.heading || normalizedBlock.props?.content) {
      return <TextSection block={normalizedBlock} isReferenced={isReferenced} {...rest} />;
    }

    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{
          border: '1px dashed rgba(243,0,166,0.4)',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'rgba(243,0,166,0.8)',
          borderRadius: '8px',
          margin: '8px 0',
        }}>
          ?? Unknown block type: <strong>{block.type}</strong> (id: {block.id})
        </div>
      );
    }
    return null;
  }

  return <Component block={normalizedBlock} isReferenced={isReferenced} {...rest} />;
}