import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { TIPO_VEICULO_LABEL } from '../../../services/veiculos'

// Painel "Instituições" atendidas no dia, vinculando instituições a veículos.
export default function InstituicoesPanel({
  vinculos, // [{ id, instituicaoNome, veiculoLabel }]
  instituicoes,
  alocacoesVeiculo, // alocações de veículo do dia (para vincular)
  desabilitado,
  onAdicionar,
  onRemover,
}) {
  const [aberto, setAberto] = useState(false)
  const [instituicaoId, setInstituicaoId] = useState('')
  const [alocacaoVeiculoId, setAlocacaoVeiculoId] = useState('')
  const [salvando, setSalvando] = useState(false)

  const semVeiculos = alocacoesVeiculo.length === 0

  async function adicionar() {
    if (!instituicaoId || !alocacaoVeiculoId) return
    setSalvando(true)
    try {
      await onAdicionar({
        instituicao: Number(instituicaoId),
        alocacao_veiculo: Number(alocacaoVeiculoId),
      })
      setAberto(false)
      setInstituicaoId('')
      setAlocacaoVeiculoId('')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card
      title="Instituições"
      action={
        <Button
          size="sm"
          variant="secondary"
          disabled={desabilitado || semVeiculos}
          onClick={() => setAberto(true)}
        >
          + Adicionar
        </Button>
      }
    >
      {vinculos.length === 0 ? (
        <p className="text-sm text-slate-500">
          {semVeiculos
            ? 'Aloque um veículo antes de vincular instituições.'
            : 'Nenhuma instituição vinculada neste dia.'}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {vinculos.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-700">{v.instituicaoNome}</p>
                <p className="text-xs text-slate-500">{v.veiculoLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemover(v.id)}
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
        title="Vincular instituição"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={adicionar}
              disabled={salvando || !instituicaoId || !alocacaoVeiculoId}
            >
              {salvando ? 'Salvando...' : 'Vincular'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Instituição</span>
            <select
              value={instituicaoId}
              onChange={(e) => setInstituicaoId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {instituicoes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Veículo</span>
            <select
              value={alocacaoVeiculoId}
              onChange={(e) => setAlocacaoVeiculoId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {alocacoesVeiculo.map((a) => (
                <option key={a.id} value={a.id}>
                  {TIPO_VEICULO_LABEL[a.veiculo?.tipo]} · {a.veiculo?.modelo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </Card>
  )
}
