import { MessageCircle, Camera, ExternalLink } from 'lucide-react';

export default function ComunidadPage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200/70 shadow-md text-center">
        <h1 className="font-heading text-xl md:text-3xl font-bold text-primary-dark">Comunidad</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Tu Historia En M&iacute; es m&aacute;s que un podcast.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <a href="https://chat.whatsapp.com/HlF62d1pyiD3Ac98Oe2EKH" target="_blank" rel="noopener noreferrer"
          className="bg-card rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200/70">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-whatsapp flex items-center justify-center mb-3 md:mb-4">
            <MessageCircle size={20} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary-dark text-base md:text-lg mb-1 md:mb-2">WhatsApp</h2>
          <p className="text-xs md:text-sm text-text-light leading-relaxed mb-3 md:mb-4">&Uacute;nete a nuestra comunidad.</p>
          <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-whatsapp hover:underline">Unirme <ExternalLink size={12} /></span>
        </a>
        <a href="https://instagram.com/tuhistoria.enmi" target="_blank" rel="noopener noreferrer"
          className="bg-card rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200/70">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-instagram flex items-center justify-center mb-3 md:mb-4">
            <Camera size={20} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-primary-dark text-base md:text-lg mb-1 md:mb-2">Instagram</h2>
          <p className="text-xs md:text-sm text-text-light leading-relaxed mb-3 md:mb-4">S&iacute;guenos en Instagram.</p>
          <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-instagram hover:underline">Seguir <ExternalLink size={12} /></span>
        </a>
      </div>

      <div className="bg-card rounded-xl p-5 md:p-6 border border-gray-200/70 shadow-md text-center">
        <p className="font-heading text-base md:text-lg italic text-primary-dark">&ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;</p>
      </div>
    </div>
  );
}
