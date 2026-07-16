import Link from 'next/link';

const TERMINOS = `
**1. Identificación**

Tu Historia en Mí es una plataforma comunitaria cristiana operada por M. Piedad Correa, Chile. Contacto: contacto.tuhistoriaenmi@gmail.com

**2. Aceptación**

Al acceder a la Plataforma, acepta estos Términos y nuestra Política de Privacidad. Debe tener 18 años o más para registrarse.

**3. Descripción del Servicio**

La Plataforma ofrece gratuitamente: podcast de testimonios, versículo del día, muro comunitario, oraciones y reflexiones, proyectos comunitarios, formulario de testimonios y perfiles de usuario.

**4. Registro y Cuenta**

- Solo pueden registrarse personas mayores de 18 años.
- El registro se realiza mediante Google Sign-In.
- Cada usuario puede tener una sola cuenta.
- Es responsable de mantener su cuenta segura y de todas las actividades realizadas bajo ella.

**5. Conducta Permitida**

La Plataforma es un espacio de comunidad espiritual cristiana. Se espera que los usuarios participen con respeto, buena fe y amor al prójimo. Puede: compartir testimonios y reflexiones, interactuar en el muro, reaccionar a publicaciones, inscribirse en proyectos y leer episodios del podcast.

**6. Conducta Prohibida**

Queda estrictamente prohibido:

- Publicar contenido ofensivo, insultante, discriminatorio o que atente contra la dignidad de las personas.
- Acosar, amenazar o intimidar a otros usuarios.
- Publicar material pornográfico, violento o inapropiado para todo público.
- Difundir noticias falsas, desinformación o contenido engañoso.
- Publicar spam, publicidad no autorizada o enlaces maliciosos.
- Suplantar la identidad de otra persona u organización.
- Usar la Plataforma para actividades ilegales.
- Intentar acceder sin autorización a sistemas o datos de la Plataforma.
- Promover ideologías de odio o violencia.

**7. Contenido del Usuario**

Usted conserva sus derechos sobre el contenido que publica. Al publicar, otorga a Tu Historia en Mí una licencia no exclusiva para mostrar y difundir ese contenido en el contexto del ministerio. Usted es el único responsable del contenido que publica.

**8. Testimonios para el Podcast**

Si envía un testimonio: quedará almacenado de forma privada hasta ser revisado por el administrador; solo se hace público si es aprobado; puede solicitar su eliminación en cualquier momento; en el podcast, usted decide si se usa su nombre o un seudónimo.

**9. Moderación**

Nos reservamos el derecho de eliminar contenido que viole estos Términos y de suspender o eliminar cuentas de usuarios infractores, sin previo aviso.

**10. Propiedad Intelectual**

El diseño, logos, código y episodios del podcast son propiedad de M. Piedad Correa / Tu Historia en Mí. Queda prohibida su reproducción comercial sin autorización escrita.

**11. Donaciones**

Las donaciones son voluntarias y no reembolsables. Son procesadas por plataformas externas (Ceneka, MercadoPago) bajo sus propios términos.

**12. Disponibilidad**

El servicio se proporciona "tal como está". No garantizamos disponibilidad ininterrumpida ni ausencia de errores.

**13. Limitación de Responsabilidad**

Tu Historia en Mí no será responsable por daños derivados del uso de la Plataforma, pérdida de datos, contenido de otros usuarios ni interrupciones del servicio.

**14. Eliminación de Cuenta**

Puede eliminar su cuenta y datos desde su Perfil (botón "Eliminar mi cuenta"). Podemos suspender cuentas que incumplan estos Términos.

**15. Menores de Edad**

La Plataforma no está dirigida a menores de 18 años. Las cuentas de menores detectadas serán eliminadas.

**16. Ley Aplicable**

Estos Términos se rigen por la legislación de la República de Chile. Controversias: Tribunales de Santiago, Chile.

**17. Contacto**

📧 contacto.tuhistoriaenmi@gmail.com — 🌐 tuhistoriaenmi.vercel.app

*Efectivos desde julio de 2026 — Versión 1.0*
`;

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark mb-2">
          Términos de Uso
        </h1>
        <p className="text-text-light text-sm">Última actualización: julio 2026 — Versión 1.0</p>
      </div>

      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md space-y-6">
        {TERMINOS.trim().split('\n\n').map((block, i) => {
          const lines = block.trim().split('\n');
          if (lines[0].startsWith('**') && lines[0].endsWith('**') && lines.length === 1) {
            return <h2 key={i} className="font-heading text-lg font-bold text-primary-dark mt-6 mb-2">{lines[0].replace(/\*\*/g, '')}</h2>;
          }
          if (lines.some(l => l.startsWith('- '))) {
            const header = lines[0].startsWith('- ') ? null : lines[0];
            const bullets = lines.filter(l => l.startsWith('- '));
            return (
              <div key={i}>
                {header && <p className="text-text leading-relaxed mb-2 text-sm" dangerouslySetInnerHTML={{ __html: header.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                <ul className="space-y-1 pl-4">
                  {bullets.map((b, bi) => <li key={bi} className="text-text text-sm leading-relaxed list-disc" dangerouslySetInnerHTML={{ __html: b.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
                </ul>
              </div>
            );
          }
          return (
            <div key={i} className="space-y-1">
              {lines.map((line, li) => (
                <p key={li} className="text-text leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link href="/privacidad" className="text-primary text-sm hover:underline">Ver Política de Privacidad →</Link>
      </div>
    </div>
  );
}
