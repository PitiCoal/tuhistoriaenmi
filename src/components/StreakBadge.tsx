'use client';

import { useEffect, useState } from 'react';
import { getUserStreak, recordDailyActivity } from '@/lib/supabase';
import { Flame } from 'lucide-react';

interface Props {
  userId: string;
  minimal?: boolean;
  onActivityRecorded?: () => void;
}

export default function StreakBadge({ userId, minimal, onActivityRecorded }: Props) {
  const [streak, setStreak] = useState<number | null>(null);
  const [longest, setLongest] = useState<number | null>(null);
  const [graceDay, setGraceDay] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, [userId]);

  async function loadStreak() {
    const data = await getUserStreak(userId);
    if (data) {
      setStreak(data.current_streak);
      setLongest(data.longest_streak);
      setGraceDay(data.grace_day_used_this_week || false);
    } else {
      await recordDailyActivity(userId);
      const fresh = await getUserStreak(userId);
      if (fresh) {
        setStreak(fresh.current_streak);
        setLongest(fresh.longest_streak);
      }
    }
    setLoading(false);
  }

  async function handleRecordActivity() {
    const { data } = await recordDailyActivity(userId);
    if (data) {
      setStreak(data.current_streak);
      setLongest(data.longest_streak);
      setGraceDay(data.grace_day_used_this_week || false);
      onActivityRecorded?.();
    }
  }

  if (loading || streak === null) return null;

  if (minimal) {
    return (
      <button onClick={handleRecordActivity} className="inline-flex items-center gap-1 text-xs font-semibold text-primary/70 hover:text-primary transition-colors" title={`Día ${streak} — Racha más larga: ${longest}`}>
        <Flame size={14} className={streak > 0 ? 'text-primary' : 'text-gray-300'} />
        {streak}
      </button>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-gray-200/70 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${streak > 0 ? 'bg-primary/10' : 'bg-gray-100'}`}>
          <Flame size={20} className={streak > 0 ? 'text-primary' : 'text-gray-300'} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-dark">{streak}</span>
            <span className="text-xs text-text-light">día{streak !== 1 ? 's' : ''} consecutivo{streak !== 1 ? 's' : ''}</span>
          </div>
          {graceDay && (
            <p className="text-[10px] text-gold font-medium mt-0.5">
              Día de gracia activo esta semana 🙏
            </p>
          )}
          <p className="text-[10px] text-text-light/70 mt-0.5">
            Racha más larga: {longest} día{longest !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleRecordActivity}
          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors active:scale-95"
          title="Registrar actividad de hoy"
        >
          +1 día
        </button>
      </div>
    </div>
  );
}
