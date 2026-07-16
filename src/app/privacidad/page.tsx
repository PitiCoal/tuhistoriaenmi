import Link from 'next/link';

const PRIVACIDAD = `
**1. Identificación del Responsable**

**Tu Historia en Mí** es operado por M. Piedad Correa, con sede en Chile. Contacto: contacto.tuhistoriaenmi@gmail.com

**2. Aceptación**

Al crear una cuenta, usted declara tener 18 años o más y aceptar esta Política y nuestros Términos de Uso.

**3. Marco Legal**

Esta Política se rige por la Ley N° 19.628 y la Ley N° 21.719 de Protección de Datos Personales de Chile.

**4. Datos que Recolectamos**

- **Datos de registro:** nombre, correo electrónico (vía Google), fecha de nacimiento, país y ciudad.
- **Datos opcionales de perfil:** teléfono, fotografía, biografía, testimonio personal.
- **Contenido generado:** publicaciones en el muro, intenciones de oración, testimonios enviados.
- **Técnicos:** identificador de usuario (UID) generado por Firebase; suscripción a notificaciones push si las autoriza.

**No recolectamos** datos de tarjeta de crédito. No realizamos seguimiento publicitario. No vendemos datos a terceros.

**5. Finalidad del Tratamiento**

Sus datos se usan para: gestionar su cuenta y perfil; permitir su participación en la comunidad; coordinar testimonios para el podcast; enviar notificaciones (solo si las autoriza); y mejorar la Plataforma con métricas anónimas.

**6. Procesadores de Datos**

| Servicio | Función |
|----------|---------|
| Google Firebase | Autenticación de usuarios |
| Supabase | Base de datos |
| Vercel | Hospedaje web |
| Gmail (Google) | Envío de correos |

Al usar la Plataforma, acepta que sus datos pueden procesarse en servidores de los EE. UU. y otros países donde operan estos proveedores.

**7. Compartición de Datos**

No cedemos sus datos con fines comerciales. Solo los compartimos si una autoridad competente lo exige mediante orden legal.

**8. Menores de Edad**

La Plataforma es exclusivamente para personas de **18 años o más**. Si un menor crea una cuenta, sus datos serán eliminados de inmediato al ser detectado.

**9. Derechos ARCO**

Tiene derecho a: Acceder a sus datos, Rectificarlos, Cancelarlos/Suprimirlos y Oponerse a su tratamiento. Puede ejercer estos derechos:
- Usando las funciones de su **Perfil** (editar datos, botón "Eliminar mi cuenta").
- Escribiendo a: **contacto.tuhistoriaenmi@gmail.com** (plazo de respuesta: 30 días hábiles).

**10. Testimonios**

Los testimonios que envía quedan **privados** hasta que el administrador los revise y apruebe para publicación. Puede solicitar su eliminación en cualquier momento.

**11. Retención de Datos**

Conservamos sus datos mientras su cuenta esté activa. Al eliminar su cuenta, los datos son borrados dentro de un plazo razonable, salvo obligación legal.

**12. Seguridad**

Usamos HTTPS/TLS, autenticación OAuth 2.0 y acceso restringido a la base de datos. Ningún sistema es 100% infalible; le notificaremos si ocurre una brecha que le afecte.

**13. Cambios a esta Política**

Notificaremos cualquier cambio significativo por correo o aviso en la Plataforma. El uso continuo implica aceptación.

**14. Contacto**

📧 contacto.tuhistoriaenmi@gmail.com  
🌐 tuhistoriaenmi.vercel.app

*Efectiva desde julio de 2026 — Versión 1.0*
`;

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-dark mb-2">
          Política de Privacidad
        </h1>
        <p className="text-text-light text-sm">Última actualización: julio 2026 — Versión 1.0</p>
      </div>

      <div className="bg-card rounded-2xl p-8 border border-gray-200/70 shadow-md prose prose-sm max-w-none space-y-6">
        {PRIVACIDAD.trim().split('\n\n').map((block, i) => {
          const lines = block.trim().split('\n');
          // Heading
          if (lines[0].startsWith('**') && lines[0].endsWith('**') && lines.length === 1) {
            return <h2 key={i} className="font-heading text-lg font-bold text-primary-dark mt-6 mb-2">{lines[0].replace(/\*\*/g, '')}</h2>;
          }
          // Table
          if (lines.some(l => l.startsWith('|'))) {
            const rows = lines.filter(l => l.startsWith('|') && !l.match(/^\|[-| ]+\|$/));
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  {rows.map((row, ri) => {
                    const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
                    return (
                      <tr key={ri} className={ri === 0 ? 'bg-primary/5 font-semibold' : 'border-t border-gray-100'}>
                        {cells.map((cell, ci) => <td key={ci} className="px-3 py-2 text-text">{cell.trim()}</td>)}
                      </tr>
                    );
                  })}
                </table>
              </div>
            );
          }
          // Bullet list
          if (lines.some(l => l.startsWith('- '))) {
            const header = lines[0].startsWith('- ') ? null : lines[0];
            const bullets = lines.filter(l => l.startsWith('- '));
            return (
              <div key={i}>
                {header && <p className="text-text leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: header.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                <ul className="space-y-1 pl-4">
                  {bullets.map((b, bi) => <li key={bi} className="text-text text-sm leading-relaxed list-disc" dangerouslySetInnerHTML={{ __html: b.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
                </ul>
              </div>
            );
          }
          // Regular paragraph
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
        <Link href="/terminos" className="text-primary text-sm hover:underline">Ver Términos de Uso →</Link>
      </div>
    </div>
  );
}
