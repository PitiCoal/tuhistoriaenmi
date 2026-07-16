import { HandHeart, ExternalLink } from 'lucide-react';
import DonationGoal from '@/components/DonationGoal';

export default function DonarPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Aportar</h1>
        <p className="text-text-light text-sm mt-1">
          Tu apoyo nos permite seguir creando contenido y creciendo como comunidad.
        </p>
      </div>

      <DonationGoal />

      <div className="bg-card rounded-xl p-8 shadow-md border border-gray-200/70 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <HandHeart size={32} className="text-primary" />
        </div>

        <p className="text-text leading-relaxed max-w-md mx-auto">
          Cada aporte, por peque&ntilde;o que sea, nos ayuda a producir nuevos episodios,
          mejorar el equipamiento y mantener viva esta comunidad de fe y testimonio.
        </p>

        <a
          href="https://ceneka.net/tuhistoriaenmi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-base font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <HandHeart size={20} /> Donar ahora
          <ExternalLink size={16} />
        </a>

        <p className="text-xs text-text-light">
          Puedes donar una vez o mensualmente. Transferencia v&iacute;a MercadoPago Chile.
        </p>
      </div>

      <div className="bg-card border border-gray-200/70 shadow-md rounded-xl p-6 text-center">
        <p className="font-heading italic text-primary-dark text-lg">
          &ldquo;Dios ama al que da con alegr&iacute;a.&rdquo;
        </p>
        <p className="text-sm text-text-light mt-1">&mdash; 2 Corintios 9,7</p>
      </div>
    </div>
  );
}
