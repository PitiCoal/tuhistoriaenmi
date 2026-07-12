import { MessageCircle, Camera, ExternalLink } from 'lucide-react';

export default function ComunidadPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Comunidad</h1>
        <p className="text-text-light text-sm mt-1">
          Tu Historia En M&iacute; es m&aacute;s que un podcast. Es una comunidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="https://chat.whatsapp.com/HlF62d1pyiD3Ac98Oe2EKH"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow block border border-gray-200/70"
        >
          <div className="w-12 h-12 rounded-full bg-whatsapp flex items-center justify-center mb-4">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary-dark text-lg mb-2">Grupo de WhatsApp</h2>
          <p className="text-sm text-text-light leading-relaxed mb-4">
            &Uacute;nete a nuestra comunidad de WhatsApp. Compartimos oraciones, avisos de nuevos episodios,
            pr&oacute;ximos encuentros y m&aacute;s.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-whatsapp hover:underline">
            Unirme al grupo <ExternalLink size={14} />
          </span>
        </a>

        <a
          href="https://instagram.com/tuhistoria.enmi"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow block border border-gray-200/70"
        >
          <div className="w-12 h-12 rounded-full bg-instagram flex items-center justify-center mb-4">
            <Camera size={24} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary-dark text-lg mb-2">Instagram</h2>
          <p className="text-sm text-text-light leading-relaxed mb-4">
            S&iacute;guenos en Instagram para contenido diario, fragmentos de episodios, frases y
            novedades del proyecto.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-instagram hover:underline">
            Seguir en Instagram <ExternalLink size={14} />
          </span>
        </a>
      </div>

      <div className="bg-card border border-gray-200/70 shadow-md rounded-xl p-6 text-center">
        <p className="font-heading text-lg italic text-primary-dark">
          &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
        </p>
      </div>
    </div>
  );
}
