export const getSection = (content: unknown, adminTitle: string) =>
  Array.isArray(content)
    ? content.find((section) => section?.adminTitle === adminTitle)
    : undefined;

export const getV = (field: unknown, language: string): string => {
  if (!field) return '';

  const value = typeof field === 'object' && field !== null && 'value' in field
    ? field.value
    : field;

  if (typeof value === 'object' && value !== null) {
    const localizedValue = value as Record<string, unknown>;
    const result = localizedValue[language] ?? localizedValue.en;
    return typeof result === 'string' ? result : '';
  }

  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
};
