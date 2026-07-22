'use client';

import { Heart, Shield, Star, Crown } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Padrino',
    price: '$5',
    period: '/mes',
    icon: Heart,
    desc: 'Ayudas a mantener la plataforma activa',
    features: ['Oración semanal por ti', 'Reporte trimestral de frutos', 'Acceso anticipado a series'],
    color: 'from-primary/5 to-primary/10 border-primary/20',
    iconColor: 'text-primary',
  },
  {
    name: 'Padrino de Oración',
    price: '$10',
    period: '/mes',
    icon: Star,
    desc: 'Fortaleces el ministerio y la comunidad',
    features: ['Todo lo del nivel anterior', 'Mencionado en oraciones del mes', 'Contenido exclusivo entre padrinos'],
    color: 'from-gold/5 to-gold/10 border-gold/30',
    iconColor: 'text-gold',
    popular: true,
  },
  {
    name: 'Ángel Guardián',
    price: '$25',
    period: '/mes',
    icon: Crown,
    desc: 'Eres parte fundamental de esta misión',
    features: ['Todo lo del nivel anterior', 'Video de agradecimiento personal', 'Invitación a encuentros online', 'Nombre en sección "Ángeles" del sitio'],
    color: 'from-primary/10 to-gold/15 border-primary/30',
    iconColor: 'text-primary-dark',
  },
];

export default function PadrinoOracion() {
  return (
    <section className="bg-card rounded-xl md:rounded-2xl border border-gray-200/70 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-gold/10 px-5 py-5 text-center border-b border-gray-100">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Shield size={24} className="text-primary" />
        </div>
        <h2 className="font-heading text-xl font-bold text-primary-dark">Padrino de Oración</h2>
        <p className="text-xs text-text-light mt-1 max-w-md mx-auto">
          No es una suscripción. Es una alianza espiritual. Al convertirte en padrino, permites que más personas encuentren consuelo en la fe.
        </p>
      </div>

      <div className="p-5 grid md:grid-cols-3 gap-4">
        {tiers.map(tier => {
          const Icon = tier.icon;
          return (
            <div key={tier.name} className={`relative rounded-xl border-2 p-5 space-y-4 transition-all hover:shadow-md ${tier.color} ${tier.popular ? 'shadow-lg scale-[1.02] md:scale-105' : ''}`}>
              {tier.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                  Recomendado
                </span>
              )}
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full bg-white/80 flex items-center justify-center mx-auto ${tier.iconColor}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-heading font-bold text-primary-dark text-sm mt-2">{tier.name}</h3>
                <p className="text-xs text-text-light mt-0.5">{tier.desc}</p>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-primary-dark">{tier.price}</span>
                  <span className="text-xs text-text-light">{tier.period}</span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {tier.features.map(f => (
                  <li key={f} className="text-[10px] text-text flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/donar"
                className={`block w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all active:scale-95 ${
                  tier.popular ? 'bg-gold text-white hover:bg-gold/90 shadow-sm' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                }`}
              >
                Elegir {tier.name}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-5 text-center">
        <p className="text-[10px] text-text-light/70 max-w-sm mx-auto">
          "Dad y se os dará; medida buena, apretada, remecida y rebosante darán en vuestro regazo." — Lucas 6:38
        </p>
      </div>
    </section>
  );
}
