'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { saveTestimonio } from '@/lib/supabase';
import { MessageCircle, CheckCircle, LogIn } from 'lucide-react';

const steps = [
  { number: 1, title: 'Cuéntanos tu historia', description: 'Llena el formulario con tus datos.' },
  { number: 2, title: 'Agendamos un encuentro', description: 'Coordinamos una primera reunión.' },
  { number: 3, title: 'Grabamos tu testimonio', description: 'Compartimos tu historia en el podcast.' },
];

export default function TestimonioPage() {
  const { user, signIn } = useAuth();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user === 'loading') return;
    setSending(true);
    setError('');
    try {
      const { error: dbError } = await saveTestimonio({
        user_id: user.uid,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      if (dbError) throw new Error(dbError.message);

      const res = await fetch('/api/testimonio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar email');
      }

      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    }
    setSending(false);
  }

  if (user === 'loading') return <div className="text-center py-20 text-text-light">Cargando...</div>;

  if (!user) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Dar Testimonio</h1>
          <p className="text-text-light text-sm mt-1">Comparte tu historia para inspirar a otros.</p>
        </div>
        <div className="bg-card rounded-xl p-8 border border-gray-200/70 shadow-md text-center space-y-3">
          <MessageCircle size={48} className="mx-auto text-text-light" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Inicia sesión</h2>
          <p className="text-sm text-text-light">Necesitas una cuenta para compartir tu testimonio.</p>
          <button onClick={() => signIn()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95">
            <LogIn size={16} /> Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Dar Testimonio</h1>
        <p className="text-text-light text-sm mt-1">Comparte tu historia para inspirar a otros.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map(s => (
          <div key={s.number} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mb-3">{s.number}</span>
            <h3 className="font-semibold text-primary-dark mb-1">{s.title}</h3>
            <p className="text-sm text-text-light">{s.description}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md space-y-4">
        <input type="text" placeholder="Tu nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
        <input type="email" placeholder="Tu correo electrónico" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
        <input type="tel" placeholder="Tu teléfono (opcional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea placeholder="Cuéntanos de qué te gustaría hablar..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
          rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={sending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50">
          <MessageCircle size={16} /> {sending ? 'Enviando...' : 'Quiero compartir mi historia'}
        </button>
        {sent && <p className="text-green-600 text-sm flex items-center gap-1.5"><CheckCircle size={16} /> ¡Gracias! Te contactaremos pronto.</p>}
      </form>
    </div>
  );
}
