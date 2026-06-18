import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { perfisService } from '../../services/perfis'
import { instituicoesService } from '../../services/instituicoes'

export default function PerfilPassageiroPage() {
  const { sessao } = useAuth()
  const passageiroId = sessao?.perfilPassageiroId
  const usuario = sessao?.usuario

  const [carregando, setCarregando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [instituicao, setInstituicao] = useState(null)

  useEffect(() => {
    if (!passageiroId) { setCarregando(false); return }
    let ativo = true
    perfisService.obterPassageiro(passageiroId)
      .then(async (p) => {
        if (!ativo) return
        setPerfil(p)
        const inst = await instituicoesService.obter(p.instituicao)
        if (!ativo) return
        setInstituicao(inst)
        setCarregando(false)
      })
    return () => { ativo = false }
  }, [passageiroId])

  if (carregando) return <AppShell title="Meu Perfil"><Spinner /></AppShell>

  const nome = usuario ? `${usuario.first_name} ${usuario.last_name}`.trim() : '—'
  const inicial = nome[0]?.toUpperCase() || 'P'
  const numMatricula = passageiroId != null ? String(passageiroId).padStart(6, '0') : '—'

  return (
    <AppShell title="Meu Perfil">
      <div className="space-y-4">
        <Link to="/passageiro" className="text-sm text-brand-600 hover:underline">
          ← Voltar
        </Link>

        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex size-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
            {inicial}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">{nome}</p>
            <p className="text-sm text-slate-500">Passageiro · {instituicao?.nome || '—'}</p>
          </div>
        </div>

        <Card title="Dados pessoais">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Item label="Nome completo"    valor={nome} />
            <Item label="CPF"              valor={usuario?.cpf || '—'} />
            <Item label="E-mail"           valor={usuario?.email || '—'} />
            <Item label="Instituição"      valor={instituicao?.nome || '—'} />
            <Item label="Nº de matrícula"  valor={numMatricula} />
            <Item
              label="Status da matrícula"
              valor={
                perfil?.matricula_valida ? (
                  <Badge color="green">Válida</Badge>
                ) : (
                  <Badge color="amber">Pendente</Badge>
                )
              }
            />
          </dl>
        </Card>

        <Carteirinha
          nome={nome}
          instituicao={instituicao?.nome}
          matricula={numMatricula}
          passageiroId={passageiroId}
        />
      </div>
    </AppShell>
  )
}

function Carteirinha({ nome, instituicao, matricula, passageiroId }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-slate-600">Carteirinha digital</h2>
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 shadow-lg">
        <div className="flex items-center gap-3 px-5 pt-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">
            T
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">
              Sistema de Transporte
            </p>
            {instituicao && <p className="text-sm font-medium text-white">{instituicao}</p>}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 px-5 py-5">
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-brand-300">Aluno</p>
              <p className="text-base font-bold text-white">{nome}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-brand-300">Matrícula</p>
              <p className="font-mono text-sm font-bold tracking-widest text-white">{matricula}</p>
            </div>
          </div>
          <div className="shrink-0 rounded-xl bg-white p-2 shadow">
            <QRCodeSVG value={String(passageiroId)} size={100} fgColor="#1e3a8a" bgColor="#ffffff" level="M" />
          </div>
        </div>

        <div className="bg-brand-900/40 px-5 py-2">
          <p className="text-[10px] text-brand-300">
            Apresente o QR code ao motorista para registrar presença.
          </p>
        </div>
      </div>
    </div>
  )
}

function Item({ label, valor }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-700">{valor}</dd>
    </div>
  )
}
