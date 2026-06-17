// Utilitários de data para a grade semanal (domingo a sábado).

export const WEEKDAYS_PT = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
]

export const WEEKDAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Converte uma Date para o formato ISO usado pelo backend (YYYY-MM-DD),
// respeitando o fuso local (evita o "pulo de dia" do toISOString em UTC).
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// dd/mm a partir de uma Date ou string ISO.
export function formatDayMonth(date) {
  const d = typeof date === 'string' ? parseISODate(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

// Interpreta "YYYY-MM-DD" como data local (sem deslocamento de fuso).
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Domingo da semana que contém `date`.
export function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

// Lista das 7 datas (domingo..sábado) da semana que contém `date`.
export function weekDays(date) {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a, b) {
  return toISODate(a) === toISODate(b)
}

// "HH:MM:SS" ou "HH:MM" -> "HH:MM"
export function formatTime(time) {
  if (!time) return ''
  return time.slice(0, 5)
}
