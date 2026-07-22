'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { logPageView } from '@/lib/supabase';
import { trackPageView } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lastLogged = useRef<string>('');

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const logKey = `${fullPath}:${userId || 'anonymous'}`;

    if (lastLogged.current === logKey) return;
    lastLogged.current = logKey;

    logPageView(fullPath, userId).catch(() => {});
    trackPageView(fullPath);
  }, [pathname, searchParams, userId]);

  return null;
}
