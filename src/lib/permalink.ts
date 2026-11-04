export * from './permalink/types';
export * from './permalink/config';
export * from './permalink/url-helper';
export {
  resolvePermalink as resolvePermalinkAsync,
  getTenantPermalinkConfig,
  setTenantPermalinkOverride,
} from './permalink/resolver';

/**
 * Synchronous blueprint dictionary lookup helper (retained for backward compatibility).
 * Fixed to handle both with and without leading slashes.
 */
export function resolvePermalink(
  pathname: string,
  permalinks?: Record<string, string>,
) {
  if (!permalinks) return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const rawBase = segments[0].toLowerCase();
  const slashBase = "/" + rawBase;

  const entry = Object.entries(permalinks).find(([, path]) => {
    if (!path || typeof path !== 'string') return false;
    const cleanPath = path.toLowerCase().replace(/^\/+|\/+$/g, '');
    return cleanPath === rawBase;
  });

  if (!entry) return null;

  return {
    type: entry[0],
    slug: segments.slice(1),
  };
}
