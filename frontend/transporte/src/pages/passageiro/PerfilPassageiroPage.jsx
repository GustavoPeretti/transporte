import { useEffect, useMemo, useState } from 'react'
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
  const passageiroId = sessao?.perfilPassageiroId ?? 1

  const [carregando, setCarregando] = useState(true)
  const [perfis, setPerfis] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [instituicoes, setInstituicoes] = useState([])

  useEffect(() => {
    let ativo = true
    Promise.all([
      perfisService.listarPassageiros(),
      perfisService.listarUsuarios(),
      instituicoesService.listar(),
    ]).then(([pp, us, ins]) => {
      if (!ativo) return
      setPerfis(pp)
      setUsuarios(us)
      setInstituicoes(ins)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [])

  const perfil = useMemo(() => perfis.find((p) => p.id === passageiroId), [perfis, passageiroId])
  const usuario = useMemo(
    () => (perfil ? usuarios.find((u) => u.id === perfil.usuario) : null),
    [perfil, usuarios],
  )
  const instituicao = useMemo(
    () => (perfil ? instituicoes.find((i) => i.id === perfil.instituicao) : null),
    [perfil, instituicoes],
  )

  if (carregando) return <AppShell title="Meu Perfil"><Spinner /></AppShell>

  const nome = usuario ? `${usuario.first_name} ${usuario.last_name}`.trim() : '—'
  const inicial = nome[0]?.toUpperCase() || 'P'
  // Número de matrícula: id do perfil formatado como 6 dígitos.
  // OBS: o backend não possui campo numero_matricula; este valor é derivado do id
  // até que o campo seja adicionado ao modelo PerfilPassageiro.
  const numMatricula = String(passageiroId).padStart(6, '0')

  return (
    <AppShell title="Meu Perfil">
      <div className="space-y-4">
        <Link to="/passageiro" className="text-sm text-brand-600 hover:underline">
          ← Voltar
        </Link>

        {/* Avatar + nome */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex size-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
            {inicial}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">{nome}</p>
            <p className="text-sm text-slate-500">Passageiro · {instituicao?.nome || '—'}</p>
          </div>
        </div>

        {/* Dados pessoais */}
        <Card title="Dados pessoais">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Item label="Nome completo" valor={nome} />
            <Item label="CPF" valor={usuario?.cpf || '—'} />
            <Item label="E-mail" valor={usuario?.email || '—'} />
            <Item label="Instituição" valor={instituicao?.nome || '—'} />
            <Item
              label="Nº de matrícula"
              valor={numMatricula}
            />
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

        {/* Carteirinha com QR code */}
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

// Carteirinha digital — o QR code codifica o id do perfil do passageiro,
// que é o valor lido pelo scanner do motorista para registrar presença.
function Carteirinha({ nome, instituicao, matricula, passageiroId }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-slate-600">Carteirinha digital</h2>
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 shadow-lg">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 px-5 pt-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white">
            T
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">
              Sistema de Transporte
            </p>
            {instituicao && (
              <p className="text-sm font-medium text-white">{instituicao}</p>
            )}
          </div>
        </div>

        {/* Corpo */}
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

          {/* QR code */}
          <div className="shrink-0 rounded-xl bg-white p-2 shadow">
            <QRCodeSVG
              value={String(passageiroId)}
              size={100}
              fgColor="#1e3a8a"
              bgColor="#ffffff"
              level="M"
            />
          </div>
        </div>

        {/* Rodapé */}
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
