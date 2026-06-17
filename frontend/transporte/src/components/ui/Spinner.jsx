// Indicador de carregamento centralizado.
export default function Spinner({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
      <span className="size-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
