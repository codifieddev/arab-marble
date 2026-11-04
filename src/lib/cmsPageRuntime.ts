import type { Page, PageBlock } from '@/lib/store/pages/pageType';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function parseJsonField(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function unwrapAdminValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(unwrapAdminValue);
  if (!isRecord(value)) return value;

  if ('type' in value && 'value' in value) {
    return unwrapAdminValue(parseJsonField(value.value));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, unwrapAdminValue(entry)]),
  );
}

function normalizeBlock(input: unknown): PageBlock {
  const source = isRecord(input) ? input : {};
  const legacyEditor = isRecord(source.props) && isRecord(source.props.legacyEditor)
    ? source.props.legacyEditor
    : null;
  const block = legacyEditor || source;
  const contentSource = Array.isArray(block.content)
    ? block.content
    : isRecord(block.content) && Array.isArray(block.content.items)
      ? block.content.items
      : [];
  const columnsSource = Array.isArray(block.columns)
    ? block.columns
    : isRecord(block.content) && Array.isArray(block.content.columns)
      ? block.content.columns
      : undefined;

  return {
    ...block,
    id: String(block.id || source.id || ''),
    type: String(block.type || source.type || 'section'),
    adminTitle: unwrapAdminValue(block.adminTitle) as PageBlock['adminTitle'],
    props: unwrapAdminValue(block.props || {}) as PageBlock['props'],
    content: contentSource.map(normalizeBlock),
    ...(columnsSource ? { columns: unwrapAdminValue(columnsSource) as PageBlock['columns'] } : {}),
  } as PageBlock;
}

export function normalizeCmsPageForRuntime(input: unknown): Page {
  const page = isRecord(input) ? input : {};
  const seo = isRecord(page.seo) ? page.seo : {};
  return {
    ...page,
    _id: page._id ? String(page._id) : undefined,
    title: unwrapAdminValue(page.title || {}) as Page['title'],
    metaTitle: unwrapAdminValue(page.metaTitle || seo.metaTitle || {}) as Page['metaTitle'],
    metaDescription: unwrapAdminValue(page.metaDescription || seo.metaDescription || {}) as Page['metaDescription'],
    slug: String(page.slug || ''),
    isPublished: page.isPublished !== false,
    content: Array.isArray(page.content) ? page.content.map(normalizeBlock) : [],
  } as unknown as Page;
}
