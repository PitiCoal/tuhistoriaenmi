'use client';

import { useState, useEffect } from 'react';
import { HandHeart, ExternalLink, Copy, Check, Info } from 'lucide-react';
import DonationGoal from '@/components/DonationGoal';
import { getPageContent } from '@/lib/supabase';

export default function DonarPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageContent('donation').then(data => {
      if (data.bank_active === 'true') {
        setBankDetails({
          titular: data.bank_titular || '',
          rut: data.bank_rut || '',
          banco: data.bank_banco || '',
          tipo: data.bank_tipo || '',
          numero: data.bank_numero || '',
          email: data.bank_email || '',
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Aportar</h1>
        <p className="text-text-light text-sm mt-1">
          Tu apoyo nos permite seguir creando contenido y creciendo como comunidad.
        </p>
      </div>

      <DonationGoal />

      {/* Online Donation Option */}
      <div className="bg-card rounded-xl p-8 shadow-md border border-gray-200/70 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <HandHeart size={32} className="text-primary" />
        </div>

        <p className="text-text leading-relaxed max-w-md mx-auto">
          Cada aporte, por pequeño que sea, nos ayuda a producir nuevos episodios,
          mejorar el equipamiento y mantener viva esta comunidad de fe y testimonio.
        </p>

        <div className="flex flex-col items-center gap-3 pt-2">
          <a
            href="https://ceneka.net/tuhistoriaenmi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <HandHeart size={20} /> Donar vía Ceneka (MercadoPago)
            <ExternalLink size={16} />
          </a>
          <p className="text-[11px] text-text-light">
            Permite donaciones únicas o suscripciones mensuales con tarjetas de débito/crédito.
          </p>
        </div>
      </div>

      {/* Bank Transfer Option */}
      {!loading && bankDetails && (
        <div className="bg-card rounded-xl p-6 md:p-8 shadow-md border border-gray-200/70 space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Info size={18} className="text-primary" />
            <h2 className="font-heading text-lg font-bold text-primary-dark">Transferencia Bancaria Directa</h2>
          </div>

          <p className="text-xs text-text-light">
            Si prefieres realizar una transferencia electrónica directa desde tu banco, utiliza los siguientes datos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Nombre Titular', value: bankDetails.titular, key: 'titular' },
              { label: 'RUT', value: bankDetails.rut, key: 'rut' },
              { label: 'Banco', value: bankDetails.banco, key: 'banco' },
              { label: 'Tipo de Cuenta', value: bankDetails.tipo, key: 'tipo' },
              { label: 'Número de Cuenta', value: bankDetails.numero, key: 'numero' },
              { label: 'Email Confirmación', value: bankDetails.email, key: 'email' },
            ].map(field => (
              <div 
                key={field.key} 
                className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-4 transition-all hover:bg-gray-100/50"
              >
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-text-light uppercase tracking-wider font-semibold">{field.label}</span>
                  <span className="block text-sm text-text font-medium truncate">{field.value}</span>
                </div>
                {field.value && (
                  <button
                    onClick={() => copyToClipboard(field.value, field.key)}
                    className="p-2 text-text-light hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 shadow-sm active:scale-90 flex-shrink-0"
                    title={`Copiar ${field.label}`}
                  >
                    {copiedField === field.key ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {copiedField && (
            <p className="text-xs text-center font-semibold text-green-600 animate-pulse">
              ¡Dato copiado al portapapeles!
            </p>
          )}
        </div>
      )}

      <div className="bg-card border border-gray-200/70 shadow-md rounded-xl p-6 text-center">
        <p className="font-heading italic text-primary-dark text-lg">
          &ldquo;Dios ama al que da con alegría.&rdquo;
        </p>
        <p className="text-sm text-text-light mt-1">&mdash; 2 Corintios 9,7</p>
      </div>
    </div>
  );
}
