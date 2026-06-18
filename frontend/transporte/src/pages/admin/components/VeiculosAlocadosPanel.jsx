import { useMemo, useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import { TIPO_VEICULO_LABEL } from '../../../services/veiculos'
import { formatTime } from '../../../lib/dates'

export default function VeiculosAlocadosPanel({
  alocacoes,
  veiculos,
  motoristas,
  desabilitado,
  onAdicionar,
  onRemover,
}) {
  const [aberto, setAberto] = useState(false)
  const [veiculoId, setVeiculoId] = useState('')
  const [motoristaId, setMotoristaId] = useState('')
  const [embarque, setEmbarque] = useState('17:45')
  const [salvando, setSalvando] = useState(false)

  // IDs dos motoristas já alocados no dia selecionado.
  const motoristaIdsAlocados = useMemo(
    () => new Set(alocacoes.map((a) => a.motorista)),
    [alocacoes],
  )

  async function adicionar() {
    if (!veiculoId || !motoristaId) return
    setSalvando(true)
    try {
      await onAdicionar({
        veiculo: Number(veiculoId),
        motorista: Number(motoristaId),
        embarque: `${embarque}:00`,
      })
      setAberto(false)
      setVeiculoId('')
      setMotoristaId('')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card
      title="Veículos alocados"
      action={
        <Button
          size="sm"
          variant="secondary"
          disabled={desabilitado}
          onClick={() => setAberto(true)}
        >
          + Adicionar
        </Button>
      }
    >
      {alocacoes.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum veículo alocado neste dia.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {alocacoes.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {TIPO_VEICULO_LABEL[a.veiculo?.tipo]}{' '}
                  <span className="text-slate-400">({a.veiculo?.capacidade})</span>
                </p>
                <p className="text-xs text-slate-500">
                  {a.motoristaNome} · embarque {formatTime(a.embarque)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemover(a.id)}
                className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={aberto}
        onClose={() => setAberto(false)}
        title="Alocar veículo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionar} disabled={salvando || !veiculoId || !motoristaId}>
              {salvando ? 'Salvando...' : 'Alocar'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Campo label="Veículo">
            <select
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {TIPO_VEICULO_LABEL[v.tipo]} · {v.modelo} ({v.capacidade})
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Motorista">
            <select
              value={motoristaId}
              onChange={(e) => setMotoristaId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {motoristas.map((m) => {
                const jaAlocado = motoristaIdsAlocados.has(m.id)
                return (
                  <option key={m.id} value={m.id} disabled={jaAlocado}>
                    {m.nome}{jaAlocado ? ' — já alocado' : ''}
                  </option>
                )
              })}
            </select>
            {motoristaIdsAlocados.size > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                Motoristas com "já alocado" estão em outro veículo neste dia.
              </p>
            )}
          </Campo>

          <Campo label="Horário de embarque">
            <input
              type="time"
              value={embarque}
              onChange={(e) => setEmbarque(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </Campo>
        </div>
      </Modal>

      {alocacoes.length > 0 && (
        <div className="mt-3 flex justify-end">
          <Badge color="gray">
            {alocacoes.reduce((s, a) => s + (a.veiculo?.capacidade || 0), 0)} lugares no total
          </Badge>
        </div>
      )}
    </Card>
  )
}

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}
