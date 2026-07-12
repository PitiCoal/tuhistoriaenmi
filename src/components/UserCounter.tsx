'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users } from 'lucide-react';

export default function UserCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        setCount(count ?? 0);
      } catch { setCount(0); }
    })();
  }, []);

  if (count === null) return null;

  return (
    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 text-center space-y-2">
      <Users size={28} className="mx-auto text-primary" />
      <p className="font-heading text-3xl font-bold text-primary">{count}</p>
      <p className="text-sm text-text-light">
        {count === 1 ? 'persona ya es parte' : 'personas ya son parte'} de esta comunidad
      </p>
    </div>
  );
}
