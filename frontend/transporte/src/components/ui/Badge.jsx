// Etiqueta colorida para status curtos.
const CORES = {
  brand: 'bg-brand-100 text-brand-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-100 text-amber-700',
}

export default function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES[color]} ${className}`}
    >
      {children}
    </span>
  )
}
