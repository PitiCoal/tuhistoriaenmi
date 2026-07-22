export type OracionGuiada = {
  id: string
  titulo: string
  tema: string
  duracion: string
  descripcion: string
  audio_url: string
  imagen: string
  guion: string
}

const FALLBACK_IMAGE = '/images/logo.png'

export const oracionesGuiadas: OracionGuiada[] = [
  {
    id: 'og-1',
    titulo: 'Respira y Confía',
    tema: 'Confianza',
    duracion: '5 min',
    descripcion: 'Una oración guiada para soltar tus preocupaciones y confiar en que Dios tiene el control.',
    audio_url: '',
    imagen: FALLBACK_IMAGE,
    guion: 'Cierra los ojos. Respira profundo. Siente la presencia de Dios a tu alrededor. Entrega cada preocupación en Sus manos, una por una. Él te sostiene.',
  },
  {
    id: 'og-2',
    titulo: 'El Abrazo del Padre',
    tema: 'Amor de Dios',
    duracion: '7 min',
    descripcion: 'Permite que Dios te abrace espiritualmente. Una oración para sentir el amor incondicional del Padre.',
    audio_url: '',
    imagen: FALLBACK_IMAGE,
    guion: 'Imagina que estás en un lugar seguro. Jesús está frente a ti, sonriendo. Extiende Sus brazos y te invita a descansar en Su pecho. Déjate amar.',
  },
  {
    id: 'og-3',
    titulo: 'Señor, enséñame a perdonar',
    tema: 'Perdón',
    duracion: '8 min',
    descripcion: 'Una guía para soltar el rencor y abrir tu corazón al perdón, comenzando por ti mismo.',
    audio_url: '',
    imagen: FALLBACK_IMAGE,
    guion: 'Trae a tu mente a quien necesitas perdonar. Observa tu dolor sin juzgarlo. Pídele a Dios la gracia de perdonar. Suelta el peso. Deja que Su paz llene ese espacio.',
  },
  {
    id: 'og-4',
    titulo: 'Caminando con Jesús',
    tema: 'Discernimiento',
    duracion: '10 min',
    descripcion: 'Una oración para tomar decisiones importantes, pidiendo la luz del Espíritu Santo.',
    audio_url: '',
    imagen: FALLBACK_IMAGE,
    guion: 'Visualiza un camino frente a ti. Jesús camina a tu lado. Háblale de tu decisión. Escucha Su voz en el silencio. Él iluminará tus pasos.',
  },
  {
    id: 'og-5',
    titulo: 'Gracias, Señor',
    tema: 'Gratitud',
    duracion: '5 min',
    descripcion: 'Una oración de gratitud para reconocer las bendiciones grandes y pequeñas de tu día.',
    audio_url: '',
    imagen: FALLBACK_IMAGE,
    guion: 'Haz silencio interior. Agradece por el don de este día. Por las personas que amas. Por las dificultades que te hacen crecer. Por Su amor incondicional.',
  },
  {
    id: 'og-6',
    titulo: 'En tus manos, Señor',
    tema: 'Abandono',
    duracion: '6 min',
    descripcion: 'Una oración de abandono total en la voluntad de Dios, inspirada en San Carlos de Foucauld.',
    audio_url: '',
    imagen: FALLBACK_IMAGE,
    guion: 'Padre, me abandono a Ti. Haz de mí lo que quieras. Sea lo que sea, te doy gracias. Estoy listo para todo. Lo acepto todo con tal que Tu voluntad se cumpla en mí.',
  },
]
