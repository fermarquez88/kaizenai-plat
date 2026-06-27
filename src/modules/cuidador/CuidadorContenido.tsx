import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ShadowGuia } from '../../components/ShadowGuia'
import entender from '../../content/cuidador/guia/entender.html?raw'
import hacer from '../../content/cuidador/guia/hacer.html?raw'
import recursos from '../../content/cuidador/guia/recursos.html?raw'
import apoyoContactos from '../../content/cuidador/guia/apoyo.html?raw'
import cuidarse from '../../content/cuidador/guia/cuidarse.html?raw'

// Guía del cuidador con la MISMA experiencia de kaizen-cuidadores (tarjetas + niveles de
// detalle + Experto + leer en voz), portada nativa vía ShadowGuia. Ya no es texto plano.
const SECCIONES: Record<string, { titulo: string; html: string }> = {
  entender: { titulo: 'Entender la enfermedad', html: entender },
  dice: { titulo: 'Necesito resolver una situación ahora', html: hacer },
  recursos: { titulo: 'Recursos y materiales', html: recursos },
  ayuda: { titulo: 'Dónde pedir ayuda', html: apoyoContactos },
  apoyo: { titulo: 'Cuidarse para poder cuidar', html: cuidarse },
}

export function CuidadorContenido() {
  const { profileId, seccion } = useParams()
  const data = seccion ? SECCIONES[seccion] : undefined
  const back = `/p/${profileId ?? 'cuidador'}`

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link to={back} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
        <p className="mt-4 text-muted">Contenido no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <Link to={back} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="mb-3 font-serif text-2xl text-ink">{data.titulo}</h1>
      <ShadowGuia html={data.html} />
    </div>
  )
}
