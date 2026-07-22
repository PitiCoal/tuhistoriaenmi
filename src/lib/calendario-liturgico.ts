export type SeasonLiturgica = 'adviento' | 'navidad' | 'cuaresma' | 'pascua' | 'ordinario'

export interface SeasonalPrompt {
  season: SeasonLiturgica
  label: string
  icon: string
  pregunta_reflexion: string
  prompt_especial?: string
  versiculo_sugerido?: string
}

function getPascuaDate(year: number): Date {
  // Algoritmo de Gauss para fecha de Pascua
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

export function getCurrentSeason(): SeasonalPrompt {
  const now = new Date()
  const year = now.getFullYear()
  const pascua = getPascuaDate(year)
  const adviento = new Date(year, 11, 25) // 25 dic
  const navidad = new Date(year, 11, 25) // 25 dic
  const cuaresmaInicio = new Date(pascua.getTime() - 46 * 24 * 60 * 60 * 1000) // Miércoles de Ceniza

  // Calcular días desde inicio de Adviento (4to domingo antes de Navidad)
  const advientoInicio = new Date(year, 11, 25)
  advientoInicio.setDate(advientoInicio.getDate() - (advientoInicio.getDay() + 28)) // 4to domingo antes

  // Tiempo de Navidad: 25 dic hasta Bautismo del Señor (domingo post 6 enero)
  const bautismo = new Date(year, 0, 6)
  while (bautismo.getDay() !== 0) bautismo.setDate(bautismo.getDate() + 1) // domingo siguiente
  const navidadFin = new Date(year, 0, bautismo.getDate() + 1)

  // Pascua: 50 días
  const pascuaFin = new Date(pascua.getTime() + 50 * 24 * 60 * 60 * 1000) // Pentecostés

  // Mapear día a temporada
  if (now >= cuaresmaInicio && now < pascua) {
    return {
      season: 'cuaresma',
      label: 'Cuaresma',
      icon: '✝️',
      pregunta_reflexion: '¿Qué conversión está pidiendo el Señor de mi corazón en esta Cuaresma?',
      prompt_especial: 'Escribe un pequeño sacrificio o ayuno concreto para hoy.',
      versiculo_sugerido: 'Conviértete a mí de todo corazón (Joel 2,12)',
    }
  }

  if (now >= pascua && now < pascuaFin) {
    const diaPascua = Math.floor((now.getTime() - pascua.getTime()) / (24 * 60 * 60 * 1000)) + 1
    return {
      season: 'pascua',
      label: `Tiempo de Pascua (día ${diaPascua})`,
      icon: '🕊️',
      pregunta_reflexion: '¿Cómo te está llamando el Resucitado a ser testigo de su alegría hoy?',
      prompt_especial: 'Escribe una experiencia donde hayas sentido la alegría de la Resurrección.',
      versiculo_sugerido: 'Este es el día que hizo el Señor, alegrémonos y regocijémonos (Sal 118,24)',
    }
  }

  if (now >= advientoInicio && now < navidad) {
    return {
      season: 'adviento',
      label: 'Adviento',
      icon: '🕯️',
      pregunta_reflexion: '¿Qué necesitas preparar en tu corazón para recibir al Señor que viene?',
      prompt_especial: 'Escribe una esperanza concreta para esta semana de Adviento.',
      versiculo_sugerido: 'Preparen el camino del Señor, enderecen sus sendas (Mc 1,3)',
    }
  }

  if (now >= navidad && now < navidadFin) {
    return {
      season: 'navidad',
      label: 'Navidad',
      icon: '⭐',
      pregunta_reflexion: '¿Cómo se hace carne Dios en tus relaciones y en tu día a día?',
      prompt_especial: '¿A quién puedes llevar un mensaje de esperanza hoy como los pastores?',
      versiculo_sugerido: 'Y el Verbo se hizo carne y habitó entre nosotros (Jn 1,14)',
    }
  }

  const semanas = Math.floor((now.getTime() - pascuaFin.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  return {
    season: 'ordinario',
    label: `Tiempo Ordinario (semana ${semanas})`,
    icon: '🌱',
    pregunta_reflexion: '¿Qué semilla está sembrando Dios en tu vida cotidiana hoy?',
    versiculo_sugerido: 'Yo soy la vid, ustedes los sarmientos (Jn 15,5)',
  }
}

export function getPromptEstacional(): string {
  const season = getCurrentSeason()
  if (season.prompt_especial) return season.prompt_especial
  return ''
}

export function getFixedPrompts(): { id: string; label: string; placeholder: string }[] {
  return [
    {
      id: 'evangelio',
      label: '📖 Lectura del Día',
      placeholder: '¿Qué dice el Evangelio de hoy? Copia o parafrasea el pasaje...',
    },
    {
      id: 'reflexion',
      label: '💭 Lo que me dice',
      placeholder: '¿Qué palabra o frase resonó en tu corazón?',
    },
    {
      id: 'que_me_dice_dios',
      label: '🤲 Dios me habla',
      placeholder: '¿Qué crees que Dios quiere decirte personalmente hoy a través de su Palabra?',
    },
    {
      id: 'proposito',
      label: '🎯 Propósito del día',
      placeholder: 'Escribe un propósito concreto para vivir hoy lo meditado...',
    },
  ]
}
