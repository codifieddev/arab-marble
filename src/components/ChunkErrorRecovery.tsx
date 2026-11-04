'use client';

import { useEffect } from 'react';

/**
 * Listens for ChunkLoadError events (stale cached HTML after redeployment)
 * and automatically hard-reloads the page to recover gracefully.
 */
export default function ChunkErrorRecovery() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = event.message ?? '';
      if (msg.includes('ChunkLoadError') || msg.includes('Loading chunk')) {
        console.warn('[ChunkErrorRecovery] Stale chunk detected — reloading page.');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return null;
}
