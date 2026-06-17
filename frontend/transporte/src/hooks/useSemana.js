import { useMemo, useState } from 'react'
import { addDays, startOfWeek, weekDays, isSameDay } from '../lib/dates'

// Controla a navegação semanal (domingo..sábado) compartilhada pelas telas.
export function useSemana(dataInicial = new Date()) {
  const [referencia, setReferencia] = useState(() => startOfWeek(dataInicial))

  const dias = useMemo(() => weekDays(referencia), [referencia])

  const semanaAtual = useMemo(
    () => isSameDay(referencia, startOfWeek(new Date())),
    [referencia],
  )

  return {
    referencia,
    dias,
    semanaAtual,
    anterior: () => setReferencia((r) => addDays(r, -7)),
    proxima: () => setReferencia((r) => addDays(r, 7)),
    irParaAtual: () => setReferencia(startOfWeek(new Date())),
  }
}
