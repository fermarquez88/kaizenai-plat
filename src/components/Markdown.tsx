import { Fragment, type ReactNode } from 'react'

// Renderer de Markdown mínimo y nativo (sin dependencias) para el contenido educativo
// portado de kaizen-cuidadores: #/##/###, párrafos, listas '-', > citas, **negrita**,
// *cursiva* y enlaces [texto](url). Suficiente para nuestro contenido, sin traer una lib.
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = `${keyBase}-${i++}`
    if (m[1]) out.push(<a key={k} href={m[2]} target="_blank" rel="noreferrer" className="text-secondary underline break-words">{m[1]}</a>)
    else if (m[3]) out.push(<strong key={k} className="font-semibold text-ink">{m[3]}</strong>)
    else if (m[4]) out.push(<em key={k}>{m[4]}</em>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split('\n')
  const blocks: ReactNode[] = []
  let para: string[] = []
  let list: string[] = []
  let key = 0

  const flushPara = () => {
    if (!para.length) return
    blocks.push(<p key={`p${key++}`} className="mt-3 leading-relaxed text-ink">{inline(para.join(' '), `p${key}`)}</p>)
    para = []
  }
  const flushList = () => {
    if (!list.length) return
    blocks.push(
      <ul key={`u${key++}`} className="mt-2 list-disc space-y-1 pl-5 text-ink">
        {list.map((li, idx) => <li key={idx} className="leading-relaxed">{inline(li, `l${key}-${idx}`)}</li>)}
      </ul>,
    )
    list = []
  }

  for (const raw of lines) {
    const l = raw.trimEnd()
    if (l.trim() === '') { flushPara(); flushList(); continue }
    if (l.startsWith('### ')) { flushPara(); flushList(); blocks.push(<h3 key={`h${key++}`} className="mt-5 font-serif text-lg text-ink">{inline(l.slice(4), `h${key}`)}</h3>); continue }
    if (l.startsWith('## ')) { flushPara(); flushList(); blocks.push(<h2 key={`h${key++}`} className="mt-6 font-serif text-xl text-ink">{inline(l.slice(3), `h${key}`)}</h2>); continue }
    if (l.startsWith('# ')) { flushPara(); flushList(); blocks.push(<h1 key={`h${key++}`} className="mt-2 font-serif text-2xl text-ink">{inline(l.slice(2), `h${key}`)}</h1>); continue }
    if (l.startsWith('> ')) { flushPara(); flushList(); blocks.push(<blockquote key={`q${key++}`} className="mt-3 border-l-4 border-secondary/40 bg-secondary/5 py-2 pl-3 text-sm text-muted">{inline(l.slice(2), `q${key}`)}</blockquote>); continue }
    if (l.startsWith('- ')) { flushPara(); list.push(l.slice(2)); continue }
    para.push(l.trim())
  }
  flushPara(); flushList()

  return <Fragment>{blocks}</Fragment>
}
