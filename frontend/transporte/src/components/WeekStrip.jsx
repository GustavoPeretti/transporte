import { WEEKDAYS_SHORT_PT, formatDayMonth, isSameDay, toISODate } from '../lib/dates'

// Faixa de seleção semanal (domingo..sábado) com navegação entre semanas.
// `dias` vem do hook useSemana; `selecionado` é uma Date.
export default function WeekStrip({
  dias,
  selecionado,
  onSelecionar,
  semanaAtual,
  onAnterior,
  onProxima,
  onIrParaAtual,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onIrParaAtual}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            semanaAtual ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Semana atual
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onAnterior}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onProxima}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Próxima semana"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {dias.map((dia, i) => {
          const ativo = selecionado && isSameDay(dia, selecionado)
          const hoje = isSameDay(dia, new Date())
          return (
            <button
              key={toISODate(dia)}
              type="button"
              onClick={() => onSelecionar(dia)}
              className={`flex flex-col items-center rounded-xl px-0.5 py-2 transition-colors sm:px-1 ${
                ativo
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className={`text-[0.625rem] uppercase leading-tight ${ativo ? 'text-brand-100' : 'text-slate-400'}`}>
                {WEEKDAYS_SHORT_PT[i]}
              </span>
              <span className="text-xs font-semibold tabular-nums sm:text-sm">{formatDayMonth(dia)}</span>
              {hoje && !ativo && <span className="mt-0.5 size-1 rounded-full bg-brand-500" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
