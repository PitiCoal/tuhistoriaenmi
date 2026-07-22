'use client'

import { useState, useEffect } from 'react'
import { Heart, Cross, BookOpen, Sun, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const mensajes = [
  {
    cita: 'Jeremías 1:5',
    texto: '"Antes de formarte en el vientre te conocí, antes de que nacieras te consagré."',
    reflexion: 'No eres un accidente. Tu vida fue pensada, deseada y consagrada por Dios desde siempre. Cada talento, cada herida, cada alegría y cada lucha han estado en Su corazón.',
  },
  {
    cita: 'Isaías 43:1-4',
    texto: '"No temas, porque yo te he redimido; te he llamado por tu nombre; tú eres mío. Cuando pases por las aguas, yo estaré contigo."',
    reflexion: 'Dios no prometió que no habría aguas profundas, pero sí prometió estar en cada una. No estás solo en tu historia. Él camina contigo.',
  },
  {
    cita: 'Salmo 139:1-4',
    texto: '"Señor, tú me examinas y me conoces; sabes cuándo me siento y cuándo me levanto; aún antes de que una palabra esté en mi lengua, tú ya la conoces."',
    reflexion: 'Dios conoce cada pensamiento, cada lágrima no derramada, cada anhelo profundo. No necesitas fingir. Puedes ser tú mismo con Él.',
  },
  {
    cita: 'Romanos 8:28',
    texto: '"Sabemos que Dios dispone todas las cosas para el bien de quienes lo aman, de aquellos que han sido llamados según su propósito."',
    reflexion: 'Incluso lo que no entiendes hoy tiene un propósito. Dios está escribiendo una historia más grande de lo que tus ojos pueden ver.',
  },
  {
    cita: '2 Corintios 12:9',
    texto: '"Te basta mi gracia, porque mi poder se perfecciona en la debilidad."',
    reflexion: 'Tus debilidades no te alejan de Dios, te acercan a Él. Donde tú ves fragilidad, Él ve oportunidad para mostrar Su poder.',
  },
]

const oracionRespuesta = `Señor, hoy reconozco que Tú has estado en cada página de mi historia. En los momentos que entendí y en los que no, en las alegrías y en los silencios. Gracias porque nunca me has dejado solo.

Quiero aprender a verte en mi día a día. Abre mis ojos para reconocer tu paso, mi corazón para recibir tu amor y mi voz para compartir lo que Tú haces en mí.

Amén.`

export default function ElEnMiPage() {
  const [mensajeIndex, setMensajeIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const index = Math.floor(Math.random() * mensajes.length)
    setMensajeIndex(index)
  }, [])

  function handleNewMensaje() {
    setAnimating(true)
    const next = (mensajeIndex + 1) % mensajes.length
    setTimeout(() => {
      setMensajeIndex(next)
      setAnimating(false)
    }, 300)
  }

  const m = mensajes[mensajeIndex]

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden min-h-[240px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-90" />
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10" />
        <div className="relative z-10 p-8 md:p-12 text-center w-full">
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Cross size={28} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Él en mí</h1>
          <p className="text-white/80 text-sm md:text-base mt-2 max-w-md mx-auto leading-relaxed">
            &ldquo;Antes de que tú buscaran a Dios, Él ya te había encontrado.&rdquo;
          </p>
        </div>
      </section>

      {/* Dios te conoce */}
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Dios te conoce</h2>
        </div>
        <p className="text-sm text-text leading-relaxed">
          Esta sección no habla de un proyecto ni de una comunidad. Habla de ti y de Aquel que te ha amado desde siempre.
          Aquí no importa tu pasado, tu dudas o tus heridas. Solo importa una verdad: <strong>Dios ha estado en tu historia</strong>.
        </p>
        <p className="text-sm text-text leading-relaxed">
          Cada palabra en este espacio es para recordarte que no estás solo. Que cada momento de tu vida —incluso aquellos que no entiendes— tiene un sentido en los planes de Dios.
        </p>
      </div>

      {/* Mensaje de Dios para hoy */}
      <div className={`bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] rounded-2xl p-6 md:p-8 border border-primary/10 shadow-md space-y-5 transition-opacity duration-300 ${animating ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="font-heading text-lg font-bold text-primary-dark">Dios te dice hoy</h2>
          </div>
          <button onClick={handleNewMensaje}
            className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1 active:scale-95 transition-transform">
            Otro mensaje <ArrowRight size={12} />
          </button>
        </div>

        <blockquote className="bg-white/80 rounded-xl p-5 border border-primary/5 shadow-inner">
          <p className="text-base md:text-lg font-heading italic text-primary-dark leading-relaxed text-center">
            &ldquo;{m.texto}&rdquo;
          </p>
          <span className="block text-xs text-text-light text-center mt-3 font-semibold">— {m.cita}</span>
        </blockquote>

        <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-text leading-relaxed">{m.reflexion}</p>
        </div>
      </div>

      {/* Siempre ha estado */}
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Sun size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Siempre ha estado</h2>
        </div>
        <div className="space-y-3 text-sm text-text leading-relaxed">
          <p>
            Mira hacia atrás por un momento. ¿Puedes ver esos momentos donde, sin explicación, las cosas funcionaron?
            ¿Esa persona que llegó en el momento justo? ¿Esa fuerza que no sabías que tenías?
          </p>
          <p>
            <strong>Eso era Dios.</strong> No siempre con señales en el cielo, sino en el susurro de una brisa suave,
            en la palabra de un amigo, en la paz que sobrepasó tu entendimiento.
          </p>
          <p>
            Él no solo está al principio y al final. Está en cada paso. En cada lágrima. En cada sonrisa.
            Y hoy, en este mismo instante, te susurra al corazón: <em>"Estoy aquí. Siempre he estado aquí."</em>
          </p>
        </div>
      </div>

      {/* Lugares donde encontrarlo */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/diario"
          className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-primary-dark text-sm">Diario</h3>
            <p className="text-[10px] text-text-light">Habla con Él cada día</p>
          </div>
        </Link>
        <Link href="/episodios"
          className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-primary-dark text-sm">Podcast</h3>
            <p className="text-[10px] text-text-light">Historias de fe</p>
          </div>
        </Link>
      </div>

      {/* Tu respuesta */}
      <div className="bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] rounded-2xl p-6 md:p-8 border border-primary/10 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-primary-dark">Tu respuesta</h2>
        </div>
        <div className="bg-white/70 rounded-xl p-5 border border-primary/5 italic text-sm text-text leading-relaxed whitespace-pre-line">
          {oracionRespuesta}
        </div>
        <Link href="/diario"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20">
          Escribir en mi diario <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
