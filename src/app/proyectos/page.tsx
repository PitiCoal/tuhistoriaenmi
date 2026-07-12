'use client';

import { useState } from 'react';
import { Calendar, ArrowRight, Shirt, Heart, Users } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'próximo' | 'en curso' | 'completado';
  icon: 'shirt' | 'heart' | 'users';
};

const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Cachipun de la Gratitud',
    description: 'Intervención urbana: jugamos cachipun en la calle, regalamos dulces y recogemos intenciones de oración. Primera salida programada.',
    date: 'Julio 2026',
    status: 'próximo',
    icon: 'heart',
  },
  {
    id: 'p2',
    title: 'Merch TM',
    description: 'Lanzamiento de polerón y polera oficial de Tu Historia en Mí. Diseños listos, primera muestra en producción.',
    date: 'Julio 2026',
    status: 'en curso',
    icon: 'shirt',
  },
  {
    id: 'p3',
    title: 'App Comunidad TM',
    description: 'Plataforma web unificada con versículo diario, episodios, muro de oración, comunidad y donaciones.',
    date: 'Julio-Agosto 2026',
    status: 'en curso',
    icon: 'users',
  },
];

const iconMap = { shirt: Shirt, heart: Heart, users: Users };
const statusColors = {
  próximo: 'bg-blue-100 text-blue-700',
  'en curso': 'bg-gold/20 text-primary',
  completado: 'bg-green-100 text-green-700',
};

export default function ProyectosPage() {
  const [projects] = useState(initialProjects);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Proyectos</h1>
        <p className="text-secondary text-sm mt-1">
          Conoce lo que estamos preparando para la comunidad.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map(p => {
          const Icon = iconMap[p.icon];
          return (
            <div key={p.id} className="bg-card rounded-xl p-6 shadow-sm space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading font-bold text-primary">{p.title}</h2>
                  <p className="text-sm text-secondary mt-1 leading-relaxed">{p.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar size={12} /> {p.date}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>
                  {p.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 rounded-xl p-6 text-center">
        <p className="text-sm text-secondary">
          ¿Quieres ser parte de estos proyectos? 
          <a href="/comunidad" className="text-accent font-medium hover:underline ml-1">
            Únete a la comunidad <ArrowRight size={12} className="inline" />
          </a>
        </p>
      </div>
    </div>
  );
}
