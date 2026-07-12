import { HandHeart, ExternalLink } from 'lucide-react';

export default function DonarPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Aportar</h1>
        <p className="text-secondary text-sm mt-1">
          Tu apoyo nos permite seguir creando contenido y creciendo como comunidad.
        </p>
      </div>

      <div className="bg-card rounded-xl p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <HandHeart size={32} className="text-accent" />
        </div>

        <p className="text-text leading-relaxed max-w-md mx-auto">
          Cada aporte, por pequeño que sea, nos ayuda a producir nuevos episodios,
          mejorar el equipamiento y mantener viva esta comunidad de fe y testimonio.
        </p>

        <a
          href="https://ceneka.net/tuhistoriaenmi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-base font-bold hover:bg-accent/90 transition-colors"
        >
          <HandHeart size={20} /> Donar ahora &mdash; Ceneka
          <ExternalLink size={16} />
        </a>

        <p className="text-xs text-gray-400">
          Puedes donar una vez o mensualmente. Transferencia vía MercadoPago Chile.
        </p>
      </div>

      <div className="bg-gold/10 border border-gold/20 rounded-xl p-6 text-center">
        <p className="font-heading italic text-primary text-lg">
          &ldquo;Dios ama al que da con alegr&iacute;a.&rdquo;
        </p>
        <p className="text-sm text-secondary mt-1">&mdash; 2 Corintios 9,7</p>
      </div>
    </div>
  );
}
