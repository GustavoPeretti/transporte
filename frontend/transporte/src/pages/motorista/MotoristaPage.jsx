import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import QrScanner from '../../components/QrScanner'
import { useAuth } from '../../context/AuthContext'
import { planejamentosService } from '../../services/planejamentos'
import { alocacoesService } from '../../services/alocacoes'
import { veiculosService, TIPO_VEICULO_LABEL } from '../../services/veiculos'
import { instituicoesService } from '../../services/instituicoes'
import { confirmacoesService } from '../../services/confirmacoes'
import { perfisService } from '../../services/perfis'
import { formatTime, toISODate, formatDayMonth } from '../../lib/dates'

export default function MotoristaPage() {
  const { sessao } = useAuth()
  const motoristaId = sessao?.perfilMotoristaId ?? 1
  const hojeISO = toISODate(new Date())

  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState('veiculo')      // 'veiculo' | 'ida' | 'volta'
  const [qrAberto, setQrAberto] = useState(false)
  const [qrFeedback, setQrFeedback] = useState(null) // { tipo: 'ok'|'erro', msg }
  const [qrAba, setQrAba] = useState('ida')          // qual aba disparou o QR

  const [planejamentos, setPlanejamentos] = useState([])
  const [alocVeiculos, setAlocVeiculos] = useState([])
  const [alocInstituicoes, setAlocInstituicoes] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [instituicoes, setInstituicoes] = useState([])
  const [confirmacoes, setConfirmacoes] = useState([])
  const [perfisPassageiro, setPerfisPassageiro] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    let ativo = true
    Promise.all([
      planejamentosService.listar(),
      alocacoesService.listarVeiculos(),
      alocacoesService.listarInstituicoes(),
      veiculosService.listar(),
      instituicoesService.listar(),
      confirmacoesService.listar(),
      perfisService.listarPassageiros(),
      perfisService.listarUsuarios(),
    ]).then(([pl, av, ai, ve, ins, cf, pp, us]) => {
      if (!ativo) return
      setPlanejamentos(pl)
      setAlocVeiculos(av)
      setAlocInstituicoes(ai)
      setVeiculos(ve)
      setInstituicoes(ins)
      setConfirmacoes(cf)
      setPerfisPassageiro(pp)
      setUsuarios(us)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [])

  const planHoje = useMemo(
    () => planejamentos.find((p) => p.data === hojeISO),
    [planejamentos, hojeISO],
  )

  const alocacao = useMemo(() => {
    if (!planHoje) return null
    return alocVeiculos.find((a) => a.planejamento === planHoje.id && a.motorista === motoristaId)
  }, [planHoje, alocVeiculos, motoristaId])

  const veiculo = useMemo(
    () => (alocacao ? veiculos.find((v) => v.id === alocacao.veiculo) : null),
    [alocacao, veiculos],
  )

  const instituicoesRota = useMemo(() => {
    if (!alocacao) return []
    const ids = alocInstituicoes
      .filter((ai) => ai.alocacao_veiculo === alocacao.id)
      .map((ai) => ai.instituicao)
    return instituicoes.filter((i) => ids.includes(i.id))
  }, [alocacao, alocInstituicoes, instituicoes])

  // Monta a lista de passageiros enriquecida (confirmou ida ou retorno).
  const montarLista = useCallback(
    (campo) => {
      if (!alocacao || !planHoje) return []
      const idsInstituicao = instituicoesRota.map((i) => i.id)
      return confirmacoes
        .filter((c) => c.planejamento === planHoje.id && c[campo])
        .map((c) => {
          const perfil = perfisPassageiro.find((p) => p.id === c.passageiro)
          if (!perfil || !idsInstituicao.includes(perfil.instituicao)) return null
          const usuario = usuarios.find((u) => u.id === perfil.usuario)
          const inst = instituicoes.find((i) => i.id === perfil.instituicao)
          return { confirmacao: c, usuario, perfil, instituicao: inst }
        })
        .filter(Boolean)
    },
    [alocacao, planHoje, confirmacoes, perfisPassageiro, usuarios, instituicoes, instituicoesRota],
  )

  const passageirosIda = useMemo(() => montarLista('ida'), [montarLista])
  const passageirosVolta = useMemo(() => montarLista('retorno'), [montarLista])

  // Agrupa uma lista por nome da instituição.
  function agruparPorInstituicao(lista) {
    const grupos = {}
    lista.forEach((item) => {
      const nome = item.instituicao?.nome || 'Outras'
      if (!grupos[nome]) grupos[nome] = []
      grupos[nome].push(item)
    })
    return grupos
  }

  async function marcarPresenca(confirmacao, campoPresenca, valor) {
    const atualizado = await confirmacoesService.registrarPresenca(confirmacao.id, {
      [campoPresenca]: valor,
    })
    setConfirmacoes((prev) => prev.map((c) => (c.id === atualizado.id ? atualizado : c)))
  }

  // Chamado quando o scanner detecta um QR code.
  const handleQrScan = useCallback(
    async (texto) => {
      setQrAberto(false)
      const passageiroId = parseInt(texto, 10)
      if (isNaN(passageiroId)) {
        setQrFeedback({ tipo: 'erro', msg: 'QR code inválido.' })
        return
      }

      const campo = qrAba === 'ida' ? 'ida' : 'retorno'
      const campoPresenca = qrAba === 'ida' ? 'presenca_ida' : 'presenca_retorno'
      const lista = qrAba === 'ida' ? passageirosIda : passageirosVolta
      const item = lista.find((p) => p.perfil.id === passageiroId)

      if (!item) {
        setQrFeedback({ tipo: 'erro', msg: `Passageiro #${passageiroId} não confirmou ${campo === 'ida' ? 'ida' : 'volta'} hoje.` })
        return
      }

      if (item.confirmacao[campoPresenca]) {
        setQrFeedback({ tipo: 'ok', msg: `${item.usuario?.first_name || 'Passageiro'} já estava marcado como presente.` })
        return
      }

      await marcarPresenca(item.confirmacao, campoPresenca, true)
      setQrFeedback({ tipo: 'ok', msg: `${item.usuario?.first_name || 'Passageiro'} marcado como presente! ✓` })
    },
    [qrAba, passageirosIda, passageirosVolta],
  )

  function abrirQr(abaAtiva) {
    setQrAba(abaAtiva)
    setQrFeedback(null)
    setQrAberto(true)
  }

  if (carregando) return <AppShell title="Motorista"><Spinner /></AppShell>

  if (!alocacao) {
    return (
      <AppShell title="Motorista">
        <Card title={`Embarque do dia · ${formatDayMonth(new Date())}`}>
          <p className="text-sm text-slate-500">Você não possui veículo alocado para hoje.</p>
        </Card>
      </AppShell>
    )
  }

  const totalIda = passageirosIda.filter((p) => p.confirmacao.presenca_ida).length
  const totalVolta = passageirosVolta.filter((p) => p.confirmacao.presenca_retorno).length

  return (
    <AppShell title="Motorista">
      <div className="space-y-4">
        {/* Cabeçalho do dia */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {TIPO_VEICULO_LABEL[veiculo?.tipo]} às {formatTime(alocacao.embarque)}
              </p>
              <p className="text-sm text-slate-500">
                {veiculo?.modelo} · {veiculo?.placa} · {formatDayMonth(new Date())}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge color="brand">{passageirosIda.length} na ida</Badge>
              <Badge color="gray">{passageirosVolta.length} na volta</Badge>
            </div>
          </div>
        </Card>

        {/* Feedback do QR scan */}
        {qrFeedback && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              qrFeedback.tipo === 'ok'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {qrFeedback.msg}
            <button
              className="ml-3 text-xs opacity-60 hover:opacity-100"
              onClick={() => setQrFeedback(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Abas */}
        <div className="flex gap-2">
          {[
            { id: 'veiculo', label: 'Veículo' },
            { id: 'ida', label: `Ida (${totalIda}/${passageirosIda.length})` },
            { id: 'volta', label: `Volta (${totalVolta}/${passageirosVolta.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAba(t.id)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                aba === t.id
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}
        {aba === 'veiculo' && (
          <Card>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Tipo" valor={TIPO_VEICULO_LABEL[veiculo?.tipo]} />
              <Info label="Modelo" valor={veiculo?.modelo} />
              <Info label="Placa" valor={veiculo?.placa} />
              <Info label="Capacidade" valor={`${veiculo?.capacidade} lugares`} />
              <Info label="Embarque" valor={formatTime(alocacao.embarque)} />
              <Info
                label="Instituições"
                valor={instituicoesRota.map((i) => i.nome).join(', ') || '—'}
              />
            </dl>
          </Card>
        )}

        {(aba === 'ida' || aba === 'volta') && (
          <ListaEmbarque
            lista={aba === 'ida' ? passageirosIda : passageirosVolta}
            campoPresenca={aba === 'ida' ? 'presenca_ida' : 'presenca_retorno'}
            grupos={agruparPorInstituicao(aba === 'ida' ? passageirosIda : passageirosVolta)}
            onQr={() => abrirQr(aba)}
            onToggle={(conf, campo) =>
              marcarPresenca(conf, campo, !conf[campo])
            }
          />
        )}

      </div>

      {/* Modal do scanner QR */}
      <Modal
        open={qrAberto}
        onClose={() => setQrAberto(false)}
        title={`Escanear carteirinha · ${qrAba === 'ida' ? 'Ida' : 'Volta'}`}
      >
        <QrScanner onScan={handleQrScan} />
      </Modal>
    </AppShell>
  )
}

// Lista de passageiros agrupada por instituição com botão de QR e marcação manual.
function ListaEmbarque({ lista, campoPresenca, grupos, onQr, onToggle }) {
  const nomes = Object.keys(grupos)
  const totalPresentes = lista.filter((p) => p.confirmacao[campoPresenca]).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {totalPresentes}/{lista.length} presenças
        </span>
        <button
          type="button"
          onClick={onQr}
          className="flex items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <CameraIcon />
          Escanear QR
        </button>
      </div>

      {lista.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-slate-500">Nenhum passageiro confirmado.</p>
        </Card>
      ) : (
        nomes.map((nomeInst) => (
          <Card key={nomeInst} title={nomeInst}>
            <ul className="divide-y divide-slate-100">
              {grupos[nomeInst].map(({ confirmacao, usuario }) => {
                const presente = confirmacao[campoPresenca]
                return (
                  <li
                    key={confirmacao.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {usuario ? `${usuario.first_name} ${usuario.last_name}` : 'Passageiro'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggle(confirmacao, campoPresenca)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                        presente
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {presente ? '✓ Presente' : 'Marcar'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))
      )}
    </div>
  )
}

function Info({ label, valor }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-700">{valor || '—'}</dd>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
