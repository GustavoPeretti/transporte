import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { perfisService } from '../../services/perfis'

export default function PerfilMotoristaPage() {
  const { sessao } = useAuth()
  const motoristaId = sessao?.perfilMotoristaId ?? 1

  const [carregando, setCarregando] = useState(true)
  const [perfis, setPerfis] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    let ativo = true
    Promise.all([perfisService.listarMotoristas(), perfisService.listarUsuarios()]).then(
      ([pm, us]) => {
        if (!ativo) return
        setPerfis(pm)
        setUsuarios(us)
        setCarregando(false)
      },
    )
    return () => { ativo = false }
  }, [])

  const perfil = useMemo(() => perfis.find((p) => p.id === motoristaId), [perfis, motoristaId])
  const usuario = useMemo(
    () => (perfil ? usuarios.find((u) => u.id === perfil.usuario) : null),
    [perfil, usuarios],
  )

  if (carregando) return <AppShell title="Meu Perfil"><Spinner /></AppShell>

  const nome = usuario ? `${usuario.first_name} ${usuario.last_name}`.trim() : '—'
  const inicial = nome[0]?.toUpperCase() || 'M'

  return (
    <AppShell title="Meu Perfil">
      <div className="space-y-4">
        <Link to="/motorista" className="text-sm text-brand-600 hover:underline">
          ← Voltar
        </Link>

        {/* Avatar + nome */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
            {inicial}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">{nome}</p>
            <p className="text-sm text-slate-500">Motorista</p>
          </div>
        </div>

        <Card title="Dados pessoais">
          <dl className="space-y-4">
            <Item label="Nome completo" valor={nome} />
            <Item label="CPF" valor={usuario?.cpf || '—'} />
            <Item label="Habilitação (CNH)" valor={perfil?.habilitacao || '—'} />
          </dl>
        </Card>
      </div>
    </AppShell>
  )
}

function Item({ label, valor }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-semibold text-slate-700">{valor}</dd>
    </div>
  )
}
