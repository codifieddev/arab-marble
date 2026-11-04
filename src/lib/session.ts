import { User } from '@/lib/store/auth/authSlice';

export interface SessionResult {
  token: string;
  user: User;
}

export async function checkSession(): Promise<SessionResult | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('shared_data');
  if (!token) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      localStorage.removeItem('kalpzero-enterprise-auth');
      return null;
    }

    const user: User = await res.json();
    return { token, user };
  } catch {
    return null;
  }
}
