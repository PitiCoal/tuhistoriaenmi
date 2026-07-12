import { MessageCircle, Camera, ExternalLink } from 'lucide-react';

export default function ComunidadPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Comunidad</h1>
        <p className="text-secondary text-sm mt-1">
          Tu Historia en Mí es más que un podcast. Es una comunidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="https://chat.whatsapp.com/HlF62d1pyiD3Ac98Oe2EKH"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow block"
        >
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary text-lg mb-2">Grupo de WhatsApp</h2>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            Únete a nuestra comunidad de WhatsApp. Compartimos oraciones, avisos de nuevos episodios,
            próximos encuentros y más.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:underline">
            Unirme al grupo <ExternalLink size={14} />
          </span>
        </a>

        <a
          href="https://instagram.com/tuhistoria.enmi"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow block"
        >
          <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center mb-4">
            <Camera size={24} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary text-lg mb-2">Instagram</h2>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            Síguenos en Instagram para contenido diario, fragmentos de episodios, frases y
            novedades del proyecto.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:underline">
            Seguir en Instagram <ExternalLink size={14} />
          </span>
        </a>
      </div>

      <div className="bg-gold/10 border border-gold/20 rounded-xl p-6 text-center">
        <p className="font-heading text-lg italic text-primary">
          &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
        </p>
      </div>
    </div>
  );
}
