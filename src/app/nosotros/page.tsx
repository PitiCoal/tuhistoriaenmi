import { Heart, Target, Eye, Sparkles } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <section className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-center">
        <img
          src="/images/fondo-podcast.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 p-8 md:p-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
            Nuestra Historia
          </h1>
          <p className="text-white/70 mt-2 text-lg">
            C&oacute;mo naci&oacute; y qu&eacute; busca esta comunidad.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt rounded-2xl p-8 border border-gray-200/50 space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary-dark">
            C&oacute;mo empez&oacute;
          </h2>
        </div>
        <p className="text-text leading-relaxed">
          Tu Historia En M&iacute; nace del deseo de crear un espacio donde las personas puedan
          compartir y escuchar historias reales de vida. Un lugar donde el testimonio se
          convierte en puente entre quienes han vivido y quienes necesitan escuchar que
          no est&aacute;n solos.
        </p>
        <p className="text-text leading-relaxed">
          Cada episodio es una conversaci&oacute;n &iacute;ntima, sin guion, sin juicios. Solo
          una historia contada con verdad, desde el coraz&oacute;n. Porque creemos que al
          contar una historia, y al escucharla, algo en nosotros se mueve, se comprende
          o se alivia.
        </p>
      </section>

      <section className="bg-bg-alt rounded-2xl p-8 border border-gray-200/50 space-y-4">
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-primary-dark">
            Qu&eacute; buscamos
          </h2>
        </div>
        <p className="text-text leading-relaxed">
          Ser una comunidad donde cada historia sea un puente de esperanza y acompa&ntilde;amiento.
          Donde las personas puedan encontrar consuelo, inspiraci&oacute;n y fe al saber que
          otros han atravesado caminos similares.
        </p>
        <p className="text-text leading-relaxed">
          Queremos que nadie se sienta solo en sus luchas. Que cada testimonio compartido
          sea una luz para quien lo necesita. Y que esta comunidad sea un lugar seguro
          donde todos son bienvenidos.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Target size={20} className="text-primary" />
          </div>
          <h3 className="font-heading font-bold text-primary-dark">Misi&oacute;n</h3>
          <p className="text-sm text-text-light leading-relaxed">
            Crear un espacio donde las personas puedan compartir y escuchar historias reales
            de vida que inspiren, conecten y fortalezcan la fe, para que nadie se sienta
            solo en sus luchas.
          </p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye size={20} className="text-primary" />
          </div>
          <h3 className="font-heading font-bold text-primary-dark">Visi&oacute;n</h3>
          <p className="text-sm text-text-light leading-relaxed">
            Ser una comunidad donde cada historia sea un puente de esperanza y
            acompa&ntilde;amiento, creciendo como referente de testimonio y fe en
            habla hispana.
          </p>
        </div>
        <div className="bg-card rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart size={20} className="text-primary" />
          </div>
          <h3 className="font-heading font-bold text-primary-dark">Valores</h3>
          <p className="text-sm text-text-light leading-relaxed">
            Fe, empat&iacute;a, comunidad, esperanza y superaci&oacute;n. Creemos en el poder
            transformador de una historia compartida con verdad.
          </p>
        </div>
      </div>

      <section className="bg-bg-alt rounded-2xl p-8 border border-gray-200/50 space-y-4">
        <h2 className="font-heading text-xl font-bold text-primary-dark">Creadora</h2>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-2xl font-bold text-primary">MC</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-primary-dark text-lg">
              M. Piedad Correa
            </h3>
            <p className="text-sm text-text-light leading-relaxed">
              Host y creadora de Tu Historia En M&iacute;. Convencida de que cada historia tiene
              un prop&oacute;sito y que al compartirla, alguien encuentra luz en la suya.
              Este proyecto nace de la fe y del deseo de crear un espacio donde todos
              se sientan escuchados.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10 text-center space-y-4">
        <p className="font-heading text-lg italic text-primary-dark leading-relaxed">
          &ldquo;Porque cuando alguien se atreve a decirlo, otro se atreve a sentirlo.&rdquo;
        </p>
        <div className="w-12 h-0.5 bg-primary/30 mx-auto" />
        <p className="text-sm text-text-light leading-relaxed max-w-lg mx-auto italic">
          Se&ntilde;or, te pedimos que cada persona que llegue a este espacio pueda sentirse
          acogida, escuchada y amada. Que cada historia compartida sea semilla de esperanza
          en quien la escucha. Bendice a cada uno de los que conf&iacute;an en Ti y se animan
          a compartir su vida. Am&eacute;n.
        </p>
        <p className="text-xs text-text-light">— Oraci&oacute;n de Tu Historia En M&iacute;</p>
      </section>
    </div>
  );
}
