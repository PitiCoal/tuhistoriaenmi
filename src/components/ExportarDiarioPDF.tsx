'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getPersonalJournal, getDevotionalRepliesByUser } from '@/lib/supabase';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function ExportarDiarioPDF() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const userId = user && user !== 'loading' ? (user as any).uid : null;
  const displayName = user && user !== 'loading' ? (user as any).displayName || 'Hijo/a de Dios' : '';

  async function handleExport() {
    if (!userId) return;
    setExporting(true);

    try {
      const [journal, devoReplies] = await Promise.all([
        getPersonalJournal(userId),
        getDevotionalRepliesByUser(userId),
      ]);

      const today = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Testamento Espiritual — ${displayName}</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1A1A1A; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1A3A5C; font-size: 24px; text-align: center; border-bottom: 2px solid #0085C2; padding-bottom: 1rem; }
    h2 { color: #0085C2; font-size: 18px; margin-top: 2rem; }
    .meta { text-align: center; color: #6B6358; font-size: 12px; margin-bottom: 2rem; }
    .entry { background: #f9f9f9; padding: 1rem; border-left: 3px solid #0085C2; margin: 1rem 0; border-radius: 0 8px 8px 0; }
    .entry-date { color: #6B6358; font-size: 11px; }
    .entry-content { margin-top: 0.5rem; }
    .devo { background: #f0f5ff; padding: 1rem; border-left: 3px solid #5BA3A8; margin: 1rem 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd; font-size: 12px; color: #6B6358; }
    .verse { font-style: italic; text-align: center; color: #1A3A5C; margin: 2rem 0; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Mi Testamento Espiritual</h1>
  <p class="meta">${displayName} — ${today}</p>
  <p class="verse">"Porque yo sé los planes que tengo para vosotros, planes de bienestar y no de calamidad, para daros un futuro y una esperanza." — Jeremías 29:11</p>

  ${journal.length > 0 ? `
  <h2>📖 Mi Diario Espiritual</h2>
  ${journal.map((j: any) => `
    <div class="entry">
      <div class="entry-date">${new Date(j.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      <div class="entry-content">${j.content}</div>
    </div>
  `).join('')}
  ` : ''}

  ${devoReplies.length > 0 ? `
  <h2>🙏 Reflexiones de Devocionales</h2>
  ${devoReplies.map((d: any) => `
    <div class="devo">
      <div class="entry-date">Devocional: ${d.devotional_id} — ${new Date(d.created_at).toLocaleDateString('es-CL')}</div>
      <div class="entry-content">${d.answer}</div>
    </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    <p>Generado desde <strong>Tu Historia En Mí</strong> — ${today}</p>
    <p>"Donde tu historia encuentra eco"</p>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `testamento-espiritual-${displayName.toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting diary:', err);
    }

    setExporting(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !userId}
      className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-gray-200/70 rounded-xl text-sm font-semibold text-text-light hover:text-primary hover:border-primary/30 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
    >
      {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
      {exporting ? 'Generando...' : 'Exportar mi Testamento Espiritual'}
      <Download size={12} className="text-text-light/50" />
    </button>
  );
}
