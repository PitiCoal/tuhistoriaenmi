'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { logPageView } from '@/lib/supabase';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lastLogged = useRef<string>('');

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  useEffect(() => {
    // Avoid double logging the exact same path/query/user combination in the same render cycle
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const logKey = `${fullPath}:${userId || 'anonymous'}`;

    if (lastLogged.current === logKey) return;
    lastLogged.current = logKey;

    // Log the page view in Supabase
    logPageView(fullPath, userId).catch((err) => {
      console.error('Error logging page view:', err);
    });
  }, [pathname, searchParams, userId]);

  return null;
}
