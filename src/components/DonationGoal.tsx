'use client';

import { useEffect, useState } from 'react';
import { getPageContent, upsertPageContent } from '@/lib/supabase';
import { HandHeart, Pencil, X, Save, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function DonationGoal() {
  const { user } = useAuth();
  const ADMIN_EMAILS = ['piti.coal@gmail.com', 'contacto.tuhistoriaenmi@gmail.com'];
  const isAdmin = user && user !== 'loading' && ADMIN_EMAILS.includes(user.email || '');

  const [goal, setGoal] = useState({ active: false, target: 0, current: 0, title: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ active: false, target: 0, current: 0, title: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPageContent('donation').then(data => {
      const active = data.active === 'true';
      const target = parseInt(data.target) || 0;
      const current = parseInt(data.current) || 0;
      const title = data.title || 'Apoyo mensual al Ministerio';

      setGoal({ active, target, current, title });
      setEditForm({ active, target, current, title });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  // If not active, and not admin, hide completely
  if (!goal.active && !isAdmin) return null;

  const pct = Math.min(100, Math.max(0, (goal.current / (goal.target || 1)) * 100));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertPageContent('donation', 'active', String(editForm.active));
      await upsertPageContent('donation', 'title', editForm.title.trim());
      await upsertPageContent('donation', 'target', String(editForm.target));
      await upsertPageContent('donation', 'current', String(editForm.current));
      
      setGoal({ ...editForm });
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving donation goal:', err);
    }
    setSaving(false);
  };

  return (
    <div className={`bg-card rounded-xl p-5 border shadow-md space-y-3.5 relative ${
      !goal.active ? 'border-dashed border-red-300 bg-red-50/10' : 'border-primary/20 bg-gradient-to-br from-primary/[0.02] to-primary/[0.04]'
    }`}>
      {/* Admin badge and controls */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {!goal.active && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              Oculto al público
            </span>
          )}
          {success && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Check size={10} /> Guardado
            </span>
          )}
          <button 
            onClick={() => {
              setEditForm({ ...goal });
              setIsEditing(!isEditing);
            }} 
            className="p-1 rounded-lg bg-gray-100 hover:bg-primary/10 hover:text-primary transition-colors text-text-light active:scale-95"
            title="Editar Meta (Admin)"
          >
            {isEditing ? <X size={14} /> : <Pencil size={14} />}
          </button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3 pt-2">
          <h4 className="font-heading font-bold text-xs text-primary-dark">Editar Meta de Recaudación (Admin)</h4>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-active"
              checked={editForm.active}
              onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
              className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary/30"
            />
            <label htmlFor="edit-active" className="text-xs font-semibold text-text select-none cursor-pointer">
              Meta activa (visible al público)
            </label>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-semibold text-text-light mb-0.5">Título / Concepto de Donación</label>
              <input
                required
                type="text"
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-text-light mb-0.5">Meta (CLP)</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={editForm.target}
                  onChange={e => setEditForm({ ...editForm, target: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-text-light mb-0.5">Recaudado (CLP)</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={editForm.current}
                  onChange={e => setEditForm({ ...editForm, current: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Save size={12} /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-text-light rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-2 text-primary pr-12">
            <HandHeart size={18} />
            <h3 className="font-heading font-bold text-sm md:text-base text-primary-dark">Meta de Recaudación</h3>
          </div>
          
          <div className="space-y-1">
            <h4 className="font-semibold text-xs md:text-sm text-text pr-12">{goal.title}</h4>
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
        </>
      )}
    </div>
  );
}
