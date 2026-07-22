'use client'

import { useState } from 'react'


const MYSTERIES: Record<string, { name: string; color: string; list: string[] }> = {
  gozosos: {
    name: 'Misterios Gozosos',
    color: 'text-green-600 bg-green-50 border-green-200',
    list: [
      '1. La encarnación del Hijo de Dios',
      '2. La visitación de María a Santa Isabel',
      '3. El nacimiento de Jesús en Belén',
      '4. La presentación de Jesús en el Templo',
      '5. El niño Jesús perdido y hallado en el Templo',
    ],
  },
  luminosos: {
    name: 'Misterios Luminosos',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    list: [
      '1. El bautismo de Jesús en el Jordán',
      '2. Las bodas de Caná',
      '3. El anuncio del Reino de Dios',
      '4. La transfiguración de Jesús',
      '5. La institución de la Eucaristía',
    ],
  },
  dolorosos: {
    name: 'Misterios Dolorosos',
    color: 'text-red-600 bg-red-50 border-red-200',
    list: [
      '1. La oración de Jesús en el Huerto',
      '2. La flagelación de Jesús',
      '3. La coronación de espinas',
      '4. Jesús con la cruz a cuestas',
      '5. La crucifixión y muerte de Jesús',
    ],
  },
  gloriosos: {
    name: 'Misterios Gloriosos',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    list: [
      '1. La resurrección de Jesús',
      '2. La ascensión de Jesús al cielo',
      '3. La venida del Espíritu Santo',
      '4. La asunción de María al cielo',
      '5. La coronación de María como Reina del cielo',
    ],
  },
}

function getTodayMysteries(): string[] {
  const day = new Date().getDay()
  if (day === 0) return ['gloriosos']
  if (day === 1) return ['gozosos']
  if (day === 2) return ['dolorosos']
  if (day === 3) return ['gloriosos']
  if (day === 4) return ['luminosos']
  if (day === 5) return ['dolorosos']
  return ['gozosos']
}

const ORACIONES_INICIALES = [
  'Persignarse: Por la señal de la Santa Cruz, de nuestros enemigos, líbranos Señor Dios nuestro. En el nombre del Padre, del Hijo y del Espíritu Santo. Amén.',
  'Ofrecimiento: Señor mío y Dios mío, te ofrezco este rosario que voy a rezar, unido al que rezó tu Santísima Madre en la tierra, y al que rezan ahora los bienaventurados en el cielo. Amén.',
  'Credo: Creo en Dios Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor... (Credo completo)',
]

const PADRE_NUESTRO = 'Padre nuestro, que estás en el cielo, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación y líbranos del mal. Amén.'

const AVE_MARIA = 'Dios te salve María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.'

const GLORIA = 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.'

const JACULATORIA = 'María, Madre de Gracia, Madre de Misericordia, en la vida y en la muerte, ampáranos, gran Señora.'

export default function RosarioPage() {
  const [step, setStep] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const todayMysteries = getTodayMysteries()

  const steps = [
    { label: 'Inicio', content: ORACIONES_INICIALES },
    { label: '1er misterio', decades: 1 },
    { label: '2do misterio', decades: 2 },
    { label: '3er misterio', decades: 3 },
    { label: '4to misterio', decades: 4 },
    { label: '5to misterio', decades: 5 },
    { label: 'Final', content: [JACULATORIA, 'Salve Regina: Dios te salve, Reina y Madre de misericordia... Amén.'] },
  ]

  function renderDecade(mysteryIdx: number) {
    const mysteryKey = todayMysteries[mysteryIdx % todayMysteries.length]
    const mystery = MYSTERIES[mysteryKey]
    return (
      <div key={mysteryIdx} className="space-y-3">
        <div className={`p-3 rounded-xl border ${mystery.color}`}>
          <h3 className={`font-bold text-sm ${mystery.color.split(' ')[0]}`}>{mystery.name}</h3>
          <p className="text-xs text-text mt-1">{mystery.list[mysteryIdx % 5]}</p>
        </div>
        <div className="space-y-2 pl-3 text-xs text-text-light">
          <p><span className="font-semibold text-primary-dark">Padre nuestro</span> — {PADRE_NUESTRO}</p>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <p key={i}><span className="font-semibold text-primary-dark">{i}° Ave María</span> — {AVE_MARIA}</p>
          ))}
          <p><span className="font-semibold text-primary-dark">Gloria</span> — {GLORIA}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-card rounded-2xl p-6 md:p-8 border border-gray-200/70 shadow-md text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark">Santo Rosario</h1>
        <p className="text-text-light text-xs md:text-sm mt-1">Medita los misterios de la vida de Cristo</p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {todayMysteries.map(key => (
            <span key={key} className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${MYSTERIES[key].color}`}>
              {MYSTERIES[key].name}
            </span>
          ))}
        </div>
      </div>

      {/* Guía paso a paso o vista completa */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setShowAll(false)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${!showAll ? 'bg-white text-primary shadow-sm' : 'text-text-light'}`}>
          Paso a paso
        </button>
        <button onClick={() => setShowAll(true)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${showAll ? 'bg-white text-primary shadow-sm' : 'text-text-light'}`}>
          Completo
        </button>
      </div>

      {showAll ? (
        <div className="space-y-4">
          {/* Oraciones iniciales */}
          <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm space-y-3">
            <h2 className="font-heading font-bold text-primary-dark text-sm">Oraciones Iniciales</h2>
            {ORACIONES_INICIALES.map((o, i) => (
              <p key={i} className="text-xs text-text leading-relaxed">{o}</p>
            ))}
          </div>

          {/* 5 misterios */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm">
              {renderDecade(i)}
            </div>
          ))}

          {/* Oraciones finales */}
          <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm space-y-3">
            <h2 className="font-heading font-bold text-primary-dark text-sm">Oraciones Finales</h2>
            {[JACULATORIA, 'Dios te salve, Reina y Madre de misericordia... Amén.'].map((o, i) => (
              <p key={i} className="text-xs text-text leading-relaxed">{o}</p>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-primary-dark text-sm">
                Paso {step + 1} de {steps.length}
              </h2>
              <div className="flex gap-1">
                <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-text-light hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed">
                  Siguiente
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-gray-200/70 shadow-sm">
            <h3 className="font-heading font-bold text-primary-dark text-sm mb-3">{steps[step].label}</h3>
            {'content' in steps[step] ? (
              <div className="space-y-3">
                {(steps[step] as any).content.map((text: string, i: number) => (
                  <p key={i} className="text-xs text-text leading-relaxed">{text}</p>
                ))}
              </div>
            ) : (
              renderDecade((steps[step] as any).decades - 1)
            )}
          </div>

          {/* Progreso de cuentas */}
          <div className="bg-card rounded-xl p-4 border border-gray-200/70 shadow-sm">
            <p className="text-xs text-text-light text-center">
              {step === 0 ? 'Preparación' :
               step === 6 ? 'Oraciones finales' :
               `Misterio ${step} de 5`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}