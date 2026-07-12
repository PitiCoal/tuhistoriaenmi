import { Mail } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Contacto</h1>
        <p className="text-secondary text-sm mt-1">
          ¿Quieres contarnos algo? Estamos aquí para escucharte.
        </p>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm">
        <a
          href="mailto:contacto.tuhistoriaenmi@gmail.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors mb-6"
        >
          <Mail size={16} /> contacto.tuhistoriaenmi@gmail.com
        </a>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-primary">Envíanos un mensaje</h2>
        <form
          action={`mailto:contacto.tuhistoriaenmi@gmail.com`}
          method="GET"
          encType="text/plain"
          className="space-y-4"
        >
          <input
            type="text"
            name="subject"
            placeholder="Asunto"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
          <textarea
            name="body"
            placeholder="Escribe tu mensaje aquí..."
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Enviar por correo
          </button>
        </form>
      </div>
    </div>
  );
}
