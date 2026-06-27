import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Markdown } from '../../components/Markdown'
import entender from '../../content/cuidador/entender.md?raw'
import dice from '../../content/cuidador/dice.md?raw'
import recursos from '../../content/cuidador/recursos.md?raw'
import apoyo from '../../content/cuidador/apoyo.md?raw'

// Contenido educativo del cuidador PORTADO NATIVO (antes derivaba a la app externa).
// Cada sección es markdown empaquetado, renderizado en la app.
const CONTENIDO: Record<string, { titulo: string; md: string }> = {
  entender: { titulo: 'Entender la enfermedad', md: entender },
  dice: { titulo: 'Qué hacer en cada situación', md: dice },
  recursos: { titulo: 'Recursos y dónde pedir ayuda', md: recursos },
  apoyo: { titulo: 'Cuidarse para poder cuidar', md: apoyo },
}

export function CuidadorContenido() {
  const { profileId, seccion } = useParams()
  const data = seccion ? CONTENIDO[seccion] : undefined

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link to={`/p/${profileId ?? 'cuidador'}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
        <p className="mt-4 text-muted">Contenido no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <Link to={`/p/${profileId ?? 'cuidador'}`} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <article className="prose-kaizen">
        <Markdown source={data.md} />
      </article>
    </div>
  )
}
