import { Camera, Video, Music2, Podcast, Globe } from 'lucide-react';

const socialLinks = [
  { href: 'https://instagram.com/tuhistoria.enmi', icon: Camera, label: 'Instagram' },
  { href: 'https://youtube.com/@tuHistoria-EnMi', icon: Video, label: 'YouTube' },
  { href: 'https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO', icon: Music2, label: 'Spotify' },
  { href: 'https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275', icon: Podcast, label: 'Apple Podcasts' },
  { href: 'https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi', icon: Globe, label: 'Amazon Music' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-lg font-bold mb-3">Tu Historia en Mí</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Enlaces</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/episodios" className="hover:text-gold transition-colors">Episodios</a></li>
              <li><a href="/oracion" className="hover:text-gold transition-colors">Muro de Oración</a></li>
              <li><a href="/comunidad" className="hover:text-gold transition-colors">Comunidad</a></li>
              <li><a href="/donar" className="hover:text-gold transition-colors">Aportar</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Síguenos</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors"
                  aria-label={s.label}
                >
                  <s.icon size={16} />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/50">
          <p>Tu Historia en Mí &copy; {new Date().getFullYear()} &mdash; Chile</p>
          <p className="mt-1">Contacto: contacto.tuhistoriaenmi@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
