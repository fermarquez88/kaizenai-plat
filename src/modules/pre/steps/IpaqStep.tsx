import { useTranslation } from 'react-i18next'
import { usePreconsulta } from '../preconsultaStore'
import { scoreIpaq, type IpaqAnswers } from '../../../scoring/ipaq'

// Paso de actividad física (IPAQ corto): inputs NUMÉRICOS (días/minutos), distinto del
// renderer de botones. Guarda en el store bajo instruments.ipaq con índices fijos (FIELDS);
// el scoring (MET → baja/moderada/alta) vive en scoring/ipaq.ts.
const FIELDS = ['vigDays', 'vigMin', 'modDays', 'modMin', 'walkDays', 'walkMin', 'sitMin'] as const
const IDX: Record<(typeof FIELDS)[number], number> = {
  vigDays: 0, vigMin: 1, modDays: 2, modMin: 3, walkDays: 4, walkMin: 5, sitMin: 6,
}

const CAT_STYLE = {
  baja: 'text-rojo-text',
  moderada: 'text-accent-text',
  alta: 'text-verde-text',
} as const

export function IpaqStep() {
  const { t } = useTranslation()
  const answers = usePreconsulta((s) => s.instruments.ipaq) ?? {}
  const setItem = usePreconsulta((s) => s.setInstrumentItem)

  const ipaq: IpaqAnswers = {
    vigDays: answers[IDX.vigDays], vigMin: answers[IDX.vigMin],
    modDays: answers[IDX.modDays], modMin: answers[IDX.modMin],
    walkDays: answers[IDX.walkDays], walkMin: answers[IDX.walkMin],
    sitMin: answers[IDX.sitMin],
  }
  const r = scoreIpaq(ipaq)

  const Num = ({ field, kind }: { field: (typeof FIELDS)[number]; kind: 'dias' | 'min' }) => (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-16 text-muted">{t(`ipaq.${kind}`)}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={kind === 'dias' ? 7 : 960}
        value={answers[IDX[field]] ?? ''}
        onChange={(e) => {
          if (e.target.value !== '') setItem('ipaq', IDX[field], Number(e.target.value))
        }}
        className="w-24 rounded-lg border border-line bg-bg px-3 py-2 text-ink focus:border-secondary"
        aria-label={`${t(`ipaq.${field.startsWith('vig') ? 'vigorosa' : field.startsWith('mod') ? 'moderada' : field.startsWith('walk') ? 'caminar' : 'sentado'}`)} — ${t(`ipaq.${kind}`)}`}
      />
    </label>
  )

  const Bloque = ({ titulo, dias, min }: { titulo: string; dias: (typeof FIELDS)[number]; min: (typeof FIELDS)[number] }) => (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="font-medium text-ink">{titulo}</p>
      <div className="mt-2 flex flex-wrap gap-4">
        <Num field={dias} kind="dias" />
        <Num field={min} kind="min" />
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('ipaq.title')}</h1>
      <p className="mt-2 text-muted">{t('ipaq.intro')}</p>

      <div className="mt-4 space-y-3">
        <Bloque titulo={t('ipaq.vigorosa')} dias="vigDays" min="vigMin" />
        <Bloque titulo={t('ipaq.moderada')} dias="modDays" min="modMin" />
        <Bloque titulo={t('ipaq.caminar')} dias="walkDays" min="walkMin" />
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="font-medium text-ink">{t('ipaq.sentado')}</p>
          <div className="mt-2"><Num field="sitMin" kind="min" /></div>
        </div>
      </div>

      {r.answered && (
        <p className="mt-4 text-sm text-ink">
          {t('ipaq.resultado', { met: r.metMin })}{' '}
          <span className={`font-medium ${CAT_STYLE[r.categoria]}`}>{t(`ipaq.categoria.${r.categoria}`)}</span>
        </p>
      )}
    </div>
  )
}
