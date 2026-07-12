import { Camera, Video, Music2, Podcast, Globe, Mail, Heart } from 'lucide-react';

const socialLinks = [
  { href: 'https://instagram.com/tuhistoria.enmi', icon: Camera, label: 'Instagram' },
  { href: 'https://youtube.com/@tuHistoria-EnMi', icon: Video, label: 'YouTube' },
  { href: 'https://open.spotify.com/show/5BVlJIWDq8hEBvluzLs5DO', icon: Music2, label: 'Spotify' },
  { href: 'https://podcasts.apple.com/cl/podcast/tu-historia-en-mi/id6785640275', icon: Podcast, label: 'Apple' },
  { href: 'https://music.amazon.com/podcasts/cb65284d-587e-40dc-800f-736c4a89adc0/tu-historia-en-mi', icon: Globe, label: 'Amazon' },
];

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-12 md:mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="" className="h-8 w-8 md:h-10 md:w-10 brightness-0 invert" />
              <h3 className="font-heading text-base md:text-lg font-bold">Tu Historia En Mí</h3>
            </div>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed max-w-sm">
              &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
            </p>
            <a href="/donar" className="inline-flex items-center gap-1.5 text-[11px] md:text-xs text-primary font-semibold bg-white px-2.5 md:px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors">
              <Heart size={10} /> Apoyar el proyecto
            </a>
          </div>
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3">Navegar</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-white/60">
              <li><a href="/episodios" className="hover:text-white transition-colors">Episodios</a></li>
              <li><a href="/participa" className="hover:text-white transition-colors">Participa</a></li>
              <li><a href="/comunidad" className="hover:text-white transition-colors">Comunidad</a></li>
              <li><a href="/proyectos" className="hover:text-white transition-colors">Proyectos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3">Síguenos</h4>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {socialLinks.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs md:text-sm text-white/60 hover:text-white transition-colors">
                  <s.icon size={12} /> {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-6 md:mt-8 pt-4 md:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] md:text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Tu Historia En M&iacute; &mdash; Chile</p>
          <a href="mailto:contacto.tuhistoriaenmi@gmail.com" className="flex items-center gap-1 hover:text-white/60 transition-colors">
            <Mail size={10} /> contacto.tuhistoriaenmi@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
