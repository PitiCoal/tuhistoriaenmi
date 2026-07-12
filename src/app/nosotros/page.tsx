export default function NosotrosPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Nosotros</h1>
      </div>

      <section className="bg-card rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-primary text-lg">Historia</h2>
        <p className="text-text leading-relaxed">
          Tu Historia en Mí nace del deseo de crear un espacio donde las personas puedan
          compartir y escuchar historias reales de vida. Un lugar donde el testimonio se
          convierte en puente entre quienes han vivido y quienes necesitan escuchar que
          no están solos.
        </p>
        <p className="text-text leading-relaxed">
          Cada episodio es una conversaci&oacute;n íntima, sin guion, sin juicios. Solo
          una historia contada con verdad, desde el coraz&oacute;n.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <h3 className="font-heading font-bold text-primary mb-2">Misión</h3>
          <p className="text-sm text-secondary leading-relaxed">
            Crear un espacio donde las personas puedan compartir y escuchar historias reales
            de vida que inspiren, conecten y fortalezcan la fe.
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <h3 className="font-heading font-bold text-primary mb-2">Visión</h3>
          <p className="text-sm text-secondary leading-relaxed">
            Ser una comunidad donde cada historia sea un puente de esperanza y acompañamiento.
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <h3 className="font-heading font-bold text-primary mb-2">Valores</h3>
          <p className="text-sm text-secondary leading-relaxed">
            Fe, empatía, comunidad, esperanza y superaci&oacute;n. Creemos en el poder
            transformador de una historia compartida.
          </p>
        </div>
      </section>

      <section className="bg-card rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-heading font-bold text-primary text-lg">Creadora</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-heading font-bold text-primary">MC</span>
          </div>
          <div>
            <h3 className="font-semibold text-primary">M. Piedad Correa</h3>
            <p className="text-sm text-secondary mt-1 leading-relaxed">
              Host y creadora de Tu Historia en Mí. Convencida de que cada historia tiene
              un prop&oacute;sito y que al compartirla, alguien encuentra luz en la suya.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
