'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getDevotionalPlans, getPlanDevotionals, getUserPlanProgress, startPlan, completePlanDay } from '@/lib/supabase';
import { BookOpen, CheckCircle, ChevronRight, LogIn, Sparkles } from 'lucide-react';
import { useCelebration, CelebrationBanner } from '@/components/Celebration';

export default function PlanesLectio() {
  const { user, signIn } = useAuth();
  const celebration = useCelebration();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planDevos, setPlanDevos] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completingDay, setCompletingDay] = useState<number | null>(null);

  const userId = user && user !== 'loading' ? (user as any).uid : null;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const p = await getDevotionalPlans();
    setPlans(p);
    setLoading(false);
  }

  async function selectPlan(plan: any) {
    setSelectedPlan(plan);
    const devos = await getPlanDevotionals(plan.id);
    setPlanDevos(devos);
    if (userId) {
      const prog = await getUserPlanProgress(userId, plan.id);
      setProgress(prog);
    }
  }

  async function handleStart(planId: string) {
    if (!userId) { signIn(); return; }
    const { data } = await startPlan(userId, planId);
    if (data) {
      setProgress(data);
      celebration.celebrate('¡Plan iniciado! Dios te acompañe 🙏');
    }
  }

  async function handleCompleteDay(dayNumber: number) {
    if (!userId || !selectedPlan) return;
    setCompletingDay(dayNumber);
    const { data } = await completePlanDay(userId, selectedPlan.id, dayNumber);
    if (data) {
      setProgress(data);
      if (data.completed_at) {
        celebration.celebrate('¡Plan completado! Gloria a Dios 🙌');
      } else {
        celebration.celebrate(`Día ${dayNumber} completado. ¡Sigue adelante! 🙏`);
      }
    }
    setCompletingDay(null);
  }

  if (loading) return <div className="text-center py-6 text-text-light text-sm">Cargando planes...</div>;

  if (selectedPlan) {
    const completedDays = progress?.completed_days || [];
    const totalDays = selectedPlan.duration;

    return (
      <div className="bg-card rounded-xl border border-gray-200/70 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/5 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={18} className="text-primary" />
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Plan Lectio Divina</span>
              <h2 className="font-heading font-bold text-primary-dark text-sm">{selectedPlan.name}</h2>
            </div>
          </div>
          <button onClick={() => setSelectedPlan(null)} className="text-[10px] text-text-light hover:text-primary transition-colors">
            Volver
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-text-light">{selectedPlan.description}</p>

          {!progress ? (
            <button
              onClick={() => handleStart(selectedPlan.id)}
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles size={14} /> Comenzar plan de {totalDays} días
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-light">Progreso</span>
                <span className="font-semibold text-primary-dark">{completedDays.length}/{totalDays} días</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedDays.length / totalDays) * 100}%` }} />
              </div>
              {progress.completed_at && (
                <div className="bg-green-50 text-green-700 rounded-lg p-3 text-xs flex items-center gap-2 border border-green-200">
                  <CheckCircle size={14} /> ¡Plan completado!
                </div>
              )}

              <div className="space-y-1.5 mt-3 max-h-60 overflow-y-auto">
                {planDevos.map(dev => {
                  const done = completedDays.includes(dev.day_number);
                  return (
                    <div key={dev.day_number} className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${done ? 'bg-green-50/50 border border-green-100' : 'bg-gray-50/50 border border-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle size={14} className="text-green-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            {progress.current_day === dev.day_number && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </div>
                        )}
                        <span className={done ? 'text-green-700' : 'text-text'}>Día {dev.day_number}</span>
                      </div>
                      {!done && progress.current_day === dev.day_number && (
                        <button
                          onClick={() => handleCompleteDay(dev.day_number)}
                          disabled={completingDay === dev.day_number}
                          className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {completingDay === dev.day_number ? '...' : 'Completar'}
                        </button>
                      )}
                      {done && (
                        <span className="text-[10px] text-green-600">Completado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <CelebrationBanner show={celebration.show} message={celebration.message} onClose={() => celebration.setShow(false)} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-gray-200/70 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/5 px-5 py-4 border-b border-gray-100">
        <h2 className="font-heading font-bold text-primary-dark text-sm flex items-center gap-2">
          <BookOpen size={16} className="text-primary" /> Planes Lectio Divina
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {plans.length === 0 && (
          <p className="text-xs text-text-light text-center py-4">No hay planes disponibles próximamente.</p>
        )}
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => selectPlan(plan)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 bg-gray-50/30 hover:bg-primary/5 transition-all active:scale-95 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-primary-dark truncate">{plan.name}</h3>
              <p className="text-[10px] text-text-light truncate">{plan.duration} días — {plan.description?.slice(0, 60)}</p>
            </div>
            <ChevronRight size={14} className="text-text-light shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
