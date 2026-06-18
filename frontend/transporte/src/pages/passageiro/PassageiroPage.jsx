import { useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useSemana } from '../../hooks/useSemana'
import { confirmacoesService } from '../../services/confirmacoes'
import { advertenciasService } from '../../services/advertencias'
import { planejamentosService } from '../../services/planejamentos'
import { alocacoesService } from '../../services/alocacoes'
import { veiculosService, TIPO_VEICULO_LABEL } from '../../services/veiculos'
import { perfisService } from '../../services/perfis'
import { WEEKDAYS_SHORT_PT, formatDayMonth, formatTime, isSameDay, toISODate } from '../../lib/dates'

export default function PassageiroPage() {
  const { sessao } = useAuth()
  const passageiroId = sessao?.perfilPassageiroId
  const semana = useSemana()
  const [selecionado, setSelecionado] = useState(new Date())

  const [carregando, setCarregando] = useState(true)
  const [planejamentos, setPlanejamentos] = useState([])
  const [confirmacoes, setConfirmacoes] = useState([])
  const [advertencias, setAdvertencias] = useState([])
  const [alocVeiculos, setAlocVeiculos] = useState([])
  const [alocInstituicoes, setAlocInstituicoes] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [perfil, setPerfil] = useState(null)

  // Modal de justificativa
  const [justModal, setJustModal] = useState(null) // advertência selecionada
  const [justTexto, setJustTexto] = useState('')
  const [justSalvando, setJustSalvando] = useState(false)

  useEffect(() => {
    let ativo = true
    Promise.all([
      planejamentosService.listar(),
      confirmacoesService.listarPorPassageiro(passageiroId),
      advertenciasService.listarPorPassageiro(passageiroId),
      alocacoesService.listarVeiculos(),
      alocacoesService.listarInstituicoes(),
      veiculosService.listar(),
      perfisService.listarPassageiros(),
    ]).then(([pl, cf, ad, av, ai, ve, pp]) => {
      if (!ativo) return
      setPlanejamentos(pl)
      setConfirmacoes(cf)
      setAdvertencias(ad)
      setAlocVeiculos(av)
      setAlocInstituicoes(ai)
      setVeiculos(ve)
      setPerfil(pp.find((p) => p.id === passageiroId) || null)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [passageiroId])

  const planejamentoPorData = useMemo(() => {
    const mapa = {}
    planejamentos.forEach((p) => { mapa[p.data] = p })
    return mapa
  }, [planejamentos])

  const confirmacaoPorPlanejamento = useMemo(() => {
    const mapa = {}
    confirmacoes.forEach((c) => { mapa[c.planejamento] = c })
    return mapa
  }, [confirmacoes])

  // Embarque do dia selecionado para a instituição do passageiro.
  const embarqueDoDia = useMemo(() => {
    const plan = planejamentoPorData[toISODate(selecionado)]
    if (!plan || !perfil) return null
    const aloc = alocVeiculos.find((av) => {
      if (av.planejamento !== plan.id) return false
      return alocInstituicoes.some(
        (ai) => ai.alocacao_veiculo === av.id && ai.instituicao === perfil.instituicao,
      )
    })
    if (!aloc) return null
    const veiculo = veiculos.find((v) => v.id === aloc.veiculo)
    return { aloc, veiculo }
  }, [planejamentoPorData, selecionado, perfil, alocVeiculos, alocInstituicoes, veiculos])

  async function alternar(plan, campo) {
    if (!plan || !plan.aberto) return
    const atual = confirmacaoPorPlanejamento[plan.id]
    const ida = campo === 'ida' ? !(atual?.ida ?? false) : atual?.ida ?? false
    const retorno = campo === 'retorno' ? !(atual?.retorno ?? false) : atual?.retorno ?? false
    const salvo = await confirmacoesService.salvar({
      id: atual?.id,
      passageiro: passageiroId,
      planejamento: plan.id,
      ida,
      retorno,
    })
    setConfirmacoes((prev) => {
      const resto = prev.filter((c) => c.id !== salvo.id && c.planejamento !== plan.id)
      return [...resto, salvo]
    })
  }

  async function salvarJustificativa() {
    if (!justModal || !justTexto.trim()) return
    setJustSalvando(true)
    const atualizada = await advertenciasService.justificar(justModal.id, justTexto.trim())
    setAdvertencias((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)))
    setJustSalvando(false)
    setJustModal(null)
    setJustTexto('')
  }

  if (carregando) return <AppShell title="Passageiro"><Spinner /></AppShell>

  return (
    <AppShell title="Passageiro">
      <div className="space-y-4">
        {/* Embarque do dia selecionado */}
        <Card title={`Embarque do dia · ${formatDayMonth(selecionado)}`}>
          {embarqueDoDia ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">
                  {TIPO_VEICULO_LABEL[embarqueDoDia.veiculo?.tipo]} às{' '}
                  {formatTime(embarqueDoDia.aloc.embarque)}
                </p>
                <p className="text-sm text-slate-500">{embarqueDoDia.veiculo?.modelo}</p>
              </div>
              <Badge color="brand">Confirmado</Badge>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Nenhum embarque alocado para este dia.
            </p>
          )}
        </Card>

        {/* Grade semanal de confirmações — layout integrado */}
        <GradeSemana
          semana={semana}
          selecionado={selecionado}
          onSelecionar={setSelecionado}
          planejamentoPorData={planejamentoPorData}
          confirmacaoPorPlanejamento={confirmacaoPorPlanejamento}
          onAlternar={alternar}
        />

        {/* Advertências */}
        <Card title="Advertências">
          {advertencias.length === 0 ? (
            <p className="text-sm text-slate-500">Você não possui advertências.</p>
          ) : (
            <ul className="space-y-2">
              {advertencias.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-amber-800">{a.descricao}</p>
                    <Badge color="amber">{formatDayMonth(a.data)}</Badge>
                  </div>
                  {a.justificativa ? (
                    <p className="mt-1 text-xs text-amber-700">
                      <span className="font-semibold">Justificativa:</span> {a.justificativa}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setJustModal(a); setJustTexto('') }}
                      className="mt-2 text-xs font-medium text-amber-600 hover:underline"
                    >
                      Justificar →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

      </div>

      {/* Modal de justificativa */}
      <Modal
        open={Boolean(justModal)}
        onClose={() => setJustModal(null)}
        title="Justificar advertência"
        footer={
          <>
            <Button variant="secondary" onClick={() => setJustModal(null)}>Cancelar</Button>
            <Button onClick={salvarJustificativa} disabled={justSalvando || !justTexto.trim()}>
              {justSalvando ? 'Salvando...' : 'Enviar'}
            </Button>
          </>
        }
      >
        {justModal && (
          <div className="space-y-3">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {justModal.descricao}
            </p>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Justificativa</span>
              <textarea
                rows={4}
                value={justTexto}
                onChange={(e) => setJustTexto(e.target.value)}
                placeholder="Descreva o motivo da ausência..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </label>
          </div>
        )}
      </Modal>
    </AppShell>
  )
}

// Grade semanal com navegação integrada (sem WeekStrip separado).
function GradeSemana({
  semana,
  selecionado,
  onSelecionar,
  planejamentoPorData,
  confirmacaoPorPlanejamento,
  onAlternar,
}) {
  const { dias, semanaAtual, anterior, proxima, irParaAtual } = semana

  function celula(dia, campo) {
    const plan = planejamentoPorData[toISODate(dia)]
    const conf = plan ? confirmacaoPorPlanejamento[plan.id] : null
    const marcado = campo === 'ida' ? conf?.ida : conf?.retorno
    const aberto = plan?.aberto
    const diaAtivo = isSameDay(dia, selecionado)

    return (
      <td key={`${campo}-${toISODate(dia)}`} className="p-0.5 text-center">
        <button
          type="button"
          disabled={!aberto}
          onClick={() => onAlternar(plan, campo)}
          className={`mx-auto flex size-8 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
            marcado
              ? 'border-brand-600 bg-brand-600 text-white'
              : diaAtivo
              ? 'border-brand-300 bg-brand-50 text-brand-400'
              : 'border-slate-200 bg-white text-slate-300'
          } ${aberto ? 'hover:border-brand-400' : 'cursor-not-allowed opacity-40'}`}
          aria-label={`${campo === 'ida' ? 'Ida' : 'Volta'} ${toISODate(dia)}`}
        >
          {marcado ? '✓' : ''}
        </button>
      </td>
    )
  }

  return (
    <Card title="Confirmações da semana">
      {/* Navegação de semana */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={irParaAtual}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            semanaAtual ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Semana atual
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={anterior} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Semana anterior">‹</button>
          <button type="button" onClick={proxima} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="Próxima semana">›</button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '3.5rem' }} />
            {dias.map((d) => <col key={toISODate(d)} />)}
          </colgroup>
          <thead>
            <tr>
              <th />
              {dias.map((d, i) => {
                const ativo = isSameDay(d, selecionado)
                const hoje = isSameDay(d, new Date())
                return (
                  <th key={toISODate(d)} className="p-0.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelecionar(d)}
                      className={`w-full rounded-lg px-0.5 py-1 transition-colors ${
                        ativo ? 'bg-brand-600 text-white' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span className={`block text-[10px] uppercase ${ativo ? 'text-brand-200' : 'text-slate-400'}`}>
                        {WEEKDAYS_SHORT_PT[i]}
                      </span>
                      <span className={`block text-xs font-semibold ${ativo ? 'text-white' : 'text-slate-600'}`}>
                        {formatDayMonth(d)}
                      </span>
                      {hoje && !ativo && <span className="mx-auto mt-0.5 block size-1 rounded-full bg-brand-500" />}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-1 text-right text-xs font-semibold text-slate-500">Ida</td>
              {dias.map((d) => celula(d, 'ida'))}
            </tr>
            <tr>
              <td className="pr-1 text-right text-xs font-semibold text-slate-500">Volta</td>
              {dias.map((d) => celula(d, 'retorno'))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Toque em uma célula para confirmar. Toque no dia para ver o embarque. Dias fechados não aceitam alteração.
      </p>
    </Card>
  )
}
