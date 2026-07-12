import { Calendar, MapPin } from 'lucide-react';

const pastEncounters = [
  { title: 'Encuentro Junio 2026', date: 'Junio 2026', description: 'Primer encuentro mensual de la comunidad TM.' },
];

const upcoming = null;

export default function EncuentrosPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Encuentros</h1>
        <p className="text-secondary text-sm mt-1">
          Los encuentros de Tu Historia en Mí se realizan el primer domingo de cada mes. Entrada liberada.
        </p>
      </div>

      {upcoming ? (
        <div className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-accent space-y-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide">Próximo Encuentro</p>
          <h2 className="font-heading text-xl font-bold text-primary">{upcoming}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={16} /> Primer domingo del mes
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} /> Por confirmar
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-6 shadow-sm text-center">
          <p className="text-secondary">No hay próximos encuentros agendados aún. Vuelve pronto.</p>
        </div>
      )}

      {pastEncounters.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading font-bold text-primary">Encuentros Pasados</h2>
          {pastEncounters.map((enc, i) => (
            <div key={i} className="bg-card rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-primary">{enc.title}</h3>
              <p className="text-sm text-secondary mt-1">{enc.description}</p>
              <p className="text-xs text-gray-400 mt-1">{enc.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
