import { useCallback, useEffect, useMemo, useState } from 'react'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import WeekStrip from '../../components/WeekStrip'
import VeiculosAlocadosPanel from './components/VeiculosAlocadosPanel'
import InstituicoesPanel from './components/InstituicoesPanel'
import CriarUsuarioModal from './components/CriarUsuarioModal'
import { useSemana } from '../../hooks/useSemana'
import { planejamentosService } from '../../services/planejamentos'
import { alocacoesService } from '../../services/alocacoes'
import { veiculosService, TIPO_VEICULO_LABEL } from '../../services/veiculos'
import { instituicoesService } from '../../services/instituicoes'
import { confirmacoesService } from '../../services/confirmacoes'
import { perfisService } from '../../services/perfis'
import { formatDayMonth, toISODate } from '../../lib/dates'

// Mensagens dos status retornados pela rota especial /planejamentos/{id}/organizar/.
const MSG_ORGANIZAR = {
  OK: 'Planejamento organizado automaticamente.',
  NAO_EXISTE: 'Não há planejamento para este dia.',
  FECHADO: 'O planejamento está fechado.',
  SEM_VEICULO_COM_ESPACO: 'Não há veículo com espaço suficiente para a demanda.',
  MOTORISTAS_INSUFICIENTES: 'Motoristas insuficientes para os veículos necessários.',
}

export default function AdminDashboard() {
  const semana = useSemana()
  const [selecionado, setSelecionado] = useState(new Date())
  const [carregando, setCarregando] = useState(true)
  const [organizando, setOrganizando] = useState(false)
  const [organizarFeedback, setOrganizarFeedback] = useState(null)
  const [listaAberta, setListaAberta] = useState(false)
  const [criarUsuarioAberto, setCriarUsuarioAberto] = useState(false)
  const [erroCarga, setErroCarga] = useState(false)

  const [planejamentos, setPlanejamentos] = useState([])
  const [alocVeiculos, setAlocVeiculos] = useState([])
  const [alocInstituicoes, setAlocInstituicoes] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [instituicoes, setInstituicoes] = useState([])
  const [confirmacoes, setConfirmacoes] = useState([])
  const [perfisMotorista, setPerfisMotorista] = useState([])
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
      perfisService.listarMotoristas(),
      perfisService.listarPassageiros(),
      perfisService.listarUsuarios(),
    ]).then(([pl, av, ai, ve, ins, cf, pm, pp, us]) => {
      if (!ativo) return
      setPlanejamentos(pl)
      setAlocVeiculos(av)
      setAlocInstituicoes(ai)
      setVeiculos(ve)
      setInstituicoes(ins)
      setConfirmacoes(cf)
      setPerfisMotorista(pm)
      setPerfisPassageiro(pp)
      setUsuarios(us)
      setCarregando(false)
    }).catch(() => {
      if (!ativo) return
      setErroCarga(true)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [])

  const nomeMotorista = useCallback(
    (perfilId) => {
      const perfil = perfisMotorista.find((p) => p.id === perfilId)
      const usuario = perfil ? usuarios.find((u) => u.id === perfil.usuario) : null
      return usuario ? `${usuario.first_name} ${usuario.last_name}` : 'Motorista'
    },
    [perfisMotorista, usuarios],
  )

  const motoristasOptions = useMemo(
    () => perfisMotorista.map((p) => ({ id: p.id, nome: nomeMotorista(p.id) })),
    [perfisMotorista, nomeMotorista],
  )

  const planSelecionado = useMemo(
    () => planejamentos.find((p) => p.data === toISODate(selecionado)),
    [planejamentos, selecionado],
  )

  const alocacoesVeiculoDia = useMemo(() => {
    if (!planSelecionado) return []
    return alocVeiculos
      .filter((a) => a.planejamento === planSelecionado.id)
      .map((a) => ({
        ...a,
        veiculo: veiculos.find((v) => v.id === a.veiculo),
        motoristaNome: nomeMotorista(a.motorista),
      }))
  }, [planSelecionado, alocVeiculos, veiculos, nomeMotorista])

  const vinculosInstituicaoDia = useMemo(() => {
    const idsAloc = alocacoesVeiculoDia.map((a) => a.id)
    return alocInstituicoes
      .filter((ai) => idsAloc.includes(ai.alocacao_veiculo))
      .map((ai) => {
        const aloc = alocacoesVeiculoDia.find((a) => a.id === ai.alocacao_veiculo)
        const inst = instituicoes.find((i) => i.id === ai.instituicao)
        return {
          id: ai.id,
          instituicaoNome: inst?.nome || 'Instituição',
          veiculoLabel: `${TIPO_VEICULO_LABEL[aloc?.veiculo?.tipo] || ''} · ${aloc?.veiculo?.modelo || ''}`,
        }
      })
  }, [alocInstituicoes, alocacoesVeiculoDia, instituicoes])

  const totalAlunos = useMemo(() => {
    if (!planSelecionado) return 0
    return confirmacoes.filter((c) => c.planejamento === planSelecionado.id && c.ida).length
  }, [confirmacoes, planSelecionado])

  // Passageiros do dia enriquecidos com nome e instituição para lista e PDF.
  const passageirosDoDia = useMemo(() => {
    if (!planSelecionado) return []
    return confirmacoes
      .filter((c) => c.planejamento === planSelecionado.id && c.ida)
      .map((c) => {
        const perfil = perfisPassageiro.find((p) => p.id === c.passageiro)
        const usuario = perfil ? usuarios.find((u) => u.id === perfil.usuario) : null
        const inst = perfil ? instituicoes.find((i) => i.id === perfil.instituicao) : null
        return {
          confirmacao: c,
          nome: usuario
            ? `${usuario.first_name} ${usuario.last_name}`.trim()
            : `Passageiro #${c.passageiro}`,
          instituicao: inst?.nome || '—',
        }
      })
  }, [confirmacoes, planSelecionado, perfisPassageiro, usuarios, instituicoes])

  // Passageiros agrupados por instituição (para visualização e PDF).
  const gruposPorInstituicao = useMemo(() => {
    const grupos = {}
    passageirosDoDia.forEach((p) => {
      if (!grupos[p.instituicao]) grupos[p.instituicao] = []
      grupos[p.instituicao].push(p)
    })
    return grupos
  }, [passageirosDoDia])

  const fechado = !planSelecionado?.aberto

  async function alternarAberto(valor) {
    if (!planSelecionado) return
    const atualizado = await planejamentosService.definirAberto(planSelecionado.id, valor)
    setPlanejamentos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)))
  }

  async function adicionarVeiculo(payload) {
    const novo = await alocacoesService.criarVeiculo({ ...payload, planejamento: planSelecionado.id })
    setAlocVeiculos((prev) => [...prev, novo])
  }

  async function removerVeiculo(id) {
    await alocacoesService.removerVeiculo(id)
    setAlocVeiculos((prev) => prev.filter((a) => a.id !== id))
    setAlocInstituicoes((prev) => prev.filter((a) => a.alocacao_veiculo !== id))
  }

  async function adicionarInstituicao(payload) {
    const novo = await alocacoesService.criarInstituicao(payload)
    setAlocInstituicoes((prev) => [...prev, novo])
  }

  async function removerInstituicao(id) {
    await alocacoesService.removerInstituicao(id)
    setAlocInstituicoes((prev) => prev.filter((a) => a.id !== id))
  }

  // Rota especial: organiza automaticamente as alocações do dia e recarrega.
  async function organizarPlanejamento() {
    if (!planSelecionado || fechado || organizando) return
    setOrganizando(true)
    setOrganizarFeedback(null)
    try {
      const res = await planejamentosService.organizar(planSelecionado.id)
      const [av, ai] = await Promise.all([
        alocacoesService.listarVeiculos(),
        alocacoesService.listarInstituicoes(),
      ])
      setAlocVeiculos(av)
      setAlocInstituicoes(ai)
      setOrganizarFeedback({ tipo: 'ok', msg: MSG_ORGANIZAR[res?.status] || 'Planejamento organizado.' })
    } catch (err) {
      const st = err?.detail?.status
      setOrganizarFeedback({
        tipo: 'erro',
        msg: MSG_ORGANIZAR[st] || 'Erro ao organizar o planejamento.',
      })
    } finally {
      setOrganizando(false)
    }
  }

  function gerarPDF() {
    const doc = new jsPDF()
    const dataFormatada = formatDayMonth(selecionado)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Lista de Passageiros', 14, 18)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Data: ${dataFormatada}`, 14, 26)
    doc.text(`Total: ${passageirosDoDia.length} passageiro(s)`, 14, 32)

    let y = 40

    Object.entries(gruposPorInstituicao).forEach(([inst, lista]) => {
      // Cabeçalho da instituição
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30)
      doc.text(inst, 14, y)

      autoTable(doc, {
        startY: y + 3,
        head: [['#', 'Nome', 'Ida', 'Volta']],
        body: lista.map((p, i) => [
          i + 1,
          p.nome,
          p.confirmacao.ida ? 'Sim' : 'Não',
          p.confirmacao.retorno ? 'Sim' : 'Não',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 18 }, 3: { cellWidth: 18 } },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 },
      })

      y = doc.lastAutoTable.finalY + 12
    })

    doc.save(`passageiros-${toISODate(selecionado)}.pdf`)
  }

  const recarregarUsuarios = useCallback(() => {
    Promise.all([
      perfisService.listarMotoristas(),
      perfisService.listarPassageiros(),
      perfisService.listarUsuarios(),
    ]).then(([pm, pp, us]) => {
      setPerfisMotorista(pm)
      setPerfisPassageiro(pp)
      setUsuarios(us)
    })
  }, [])

  if (carregando) {
    return <AppShell title="Administrador"><Spinner /></AppShell>
  }

  if (erroCarga) {
    return (
      <AppShell title="Administrador">
        <div className="rounded-xl bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          Erro ao carregar os dados. Recarregue a página.
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Administrador">
      <div className="space-y-4">
        <WeekStrip
          dias={semana.dias}
          selecionado={selecionado}
          onSelecionar={setSelecionado}
          semanaAtual={semana.semanaAtual}
          onAnterior={semana.anterior}
          onProxima={semana.proxima}
          onIrParaAtual={semana.irParaAtual}
        />

        {/* Controle do dia */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
            <span className="text-sm font-medium text-slate-700">
              Planejamento de {formatDayMonth(selecionado)}
            </span>
            <Toggle
              checked={Boolean(planSelecionado?.aberto)}
              onChange={alternarAberto}
              label="Abrir planejamento"
            />
            <span className="text-xs text-slate-500">
              {planSelecionado?.aberto ? 'Aberto' : 'Fechado'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={fechado || organizando}
              onClick={organizarPlanejamento}
            >
              {organizando ? 'Organizando...' : 'Organizar automaticamente'}
            </Button>
            <Button variant="secondary" onClick={() => setListaAberta(true)}>
              Gerar lista de passageiros
            </Button>
            <Button variant="secondary" onClick={() => setCriarUsuarioAberto(true)}>
              + Criar usuário
            </Button>
          </div>
        </div>

        {/* Feedback da organização automática */}
        {organizarFeedback && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              organizarFeedback.tipo === 'ok'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {organizarFeedback.msg}
            <button
              className="ml-3 text-xs opacity-60 hover:opacity-100"
              onClick={() => setOrganizarFeedback(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Total de alunos */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total de alunos confirmados</p>
              <p className="text-4xl font-bold text-slate-800">{totalAlunos}</p>
              <p className="mt-0.5 text-xs text-slate-400">para {formatDayMonth(selecionado)}</p>
            </div>
          </div>
        </Card>

        {/* Painéis de alocação */}
        <div className="grid gap-4 lg:grid-cols-2">
          <VeiculosAlocadosPanel
            alocacoes={alocacoesVeiculoDia}
            veiculos={veiculos}
            motoristas={motoristasOptions}
            desabilitado={fechado}
            onAdicionar={adicionarVeiculo}
            onRemover={removerVeiculo}
          />
          <InstituicoesPanel
            vinculos={vinculosInstituicaoDia}
            instituicoes={instituicoes}
            alocacoesVeiculo={alocacoesVeiculoDia}
            desabilitado={fechado}
            onAdicionar={adicionarInstituicao}
            onRemover={removerInstituicao}
          />
        </div>
      </div>

      {/* Modal: criar motorista ou passageiro em um único formulário */}
      <CriarUsuarioModal
        open={criarUsuarioAberto}
        onClose={() => setCriarUsuarioAberto(false)}
        instituicoes={instituicoes}
        onCriado={recarregarUsuarios}
      />

      {/* Modal: lista de passageiros com visualização e geração de PDF */}
      <Modal
        open={listaAberta}
        onClose={() => setListaAberta(false)}
        title={`Lista de passageiros · ${formatDayMonth(selecionado)}`}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              {passageirosDoDia.length} passageiro(s)
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setListaAberta(false)}>
                Fechar
              </Button>
              {passageirosDoDia.length > 0 && (
                <Button onClick={gerarPDF}>
                  Baixar PDF
                </Button>
              )}
            </div>
          </div>
        }
      >
        {passageirosDoDia.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum passageiro confirmado neste dia.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(gruposPorInstituicao).map(([inst, lista]) => (
              <div key={inst}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {inst}
                </p>
                <ol className="list-decimal space-y-1.5 pl-5">
                  {lista.map(({ confirmacao, nome }) => (
                    <li key={confirmacao.id} className="text-sm text-slate-700">
                      {nome}
                      <span className="ml-1 text-xs text-slate-400">
                        {confirmacao.retorno ? '· ida e volta' : '· somente ida'}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AppShell>
  )
}
