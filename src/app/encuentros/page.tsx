import { Calendar, MapPin } from 'lucide-react';

const pastEncounters = [
  { title: 'Encuentro Junio 2026', date: 'Junio 2026', description: 'Primer encuentro mensual de la comunidad TM.' },
];

export default function EncuentrosPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Encuentros</h1>
        <p className="text-text-light text-sm mt-1">Primer domingo de cada mes. Entrada liberada.</p>
      </div>

      <div className="bg-card rounded-xl p-6 border border-gray-200/70 shadow-md text-center">
        <p className="text-text-light">No hay próximos encuentros agendados aún. Vuelve pronto.</p>
      </div>

      {pastEncounters.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading font-bold text-primary-dark">Encuentros Pasados</h2>
          {pastEncounters.map((enc, i) => (
            <div key={i} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-md">
              <h3 className="font-semibold text-primary-dark">{enc.title}</h3>
              <p className="text-sm text-text-light mt-1">{enc.description}</p>
              <p className="text-xs text-text-light/60 mt-1">{enc.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
