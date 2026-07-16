'use client';

import { useEffect, useState } from 'react';
import { getPageContent } from '@/lib/supabase';
import { HandHeart } from 'lucide-react';

export default function DonationGoal() {
  const [goal, setGoal] = useState({ active: false, target: 0, current: 0, title: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent('donation').then(data => {
      const active = data.active === 'true';
      const target = parseInt(data.target) || 0;
      const current = parseInt(data.current) || 0;
      const title = data.title || 'Apoyo mensual al Ministerio';

      setGoal({ active, target, current, title });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !goal.active || goal.target <= 0) return null;

  const pct = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-primary/20 shadow-md space-y-3.5 bg-gradient-to-br from-primary/[0.02] to-primary/[0.04]">
      <div className="flex items-center gap-2 text-primary">
        <HandHeart size={18} />
        <h3 className="font-heading font-bold text-sm md:text-base text-primary-dark">Meta de Recaudación</h3>
      </div>
      
      <div className="space-y-1">
        <h4 className="font-semibold text-xs md:text-sm text-text">{goal.title}</h4>
        <div className="flex justify-between items-end text-xs text-text-light">
          <span>{formatCurrency(goal.current)} recaudados</span>
          <span className="font-semibold">{formatCurrency(goal.target)} meta</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-100">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-right font-bold text-primary">{pct.toFixed(0)}% completado</p>
      </div>
    </div>
  );
}
