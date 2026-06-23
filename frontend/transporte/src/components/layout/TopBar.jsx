import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../config'
import { notificacoesService } from '../../services/notificacoes'

const ROLE_LABEL = {
  admin: 'Administrador',
  motorista: 'Motorista',
  passageiro: 'Passageiro',
}

const PERFIL_PATH = {
  [ROLES.MOTORISTA]: '/motorista/perfil',
  [ROLES.PASSAGEIRO]: '/passageiro/perfil',
}

function tempoAtras(dataStr) {
  const min = Math.floor((Date.now() - new Date(dataStr).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="size-5">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function PainelNotificacoes({ notificacoes, naoLidas, onMarcarTodas }) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">
          Notificações{naoLidas > 0 && <span className="ml-1 text-brand-600">({naoLidas})</span>}
        </span>
        {naoLidas > 0 && (
          <button
            type="button"
            onClick={onMarcarTodas}
            className="text-xs text-brand-600 hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
        {notificacoes.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">
            Nenhuma notificação.
          </li>
        )}
        {notificacoes.map((n) => (
          <li key={n.id} className={`px-4 py-3 ${n.lida ? 'opacity-60' : 'bg-brand-50/40'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">{n.titulo}</p>
              <span className="shrink-0 text-[10px] text-slate-400">{tempoAtras(n.criado_em)}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{n.mensagem}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TopBar({ title }) {
  const { usuario, role, logout } = useAuth()
  const nome = usuario ? `${usuario.first_name} ${usuario.last_name}`.trim() : ''
  const perfilPath = PERFIL_PATH[role] ?? null

  const [notificacoes, setNotificacoes] = useState([])
  const [painelAberto, setPainelAberto] = useState(false)
  const painelRef = useRef(null)

  // Carrega ao montar e ao abrir o painel (atualiza contador e lista).
  useEffect(() => {
    notificacoesService.listar().then(setNotificacoes).catch(() => {})
  }, [painelAberto])

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!painelAberto) return
    function handleClick(e) {
      if (painelRef.current && !painelRef.current.contains(e.target)) {
        setPainelAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [painelAberto])

  async function marcarTodas() {
    await notificacoesService.marcarTodasLidas()
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            T
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800">
              {title || ROLE_LABEL[role]}
            </p>
            <p className="text-xs text-slate-500">Sistema de Transporte</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-700">{nome}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[role]}</p>
          </div>

          {/* Sino de notificações */}
          <div className="relative" ref={painelRef}>
            <button
              type="button"
              onClick={() => setPainelAberto((v) => !v)}
              className="relative flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title="Notificações"
            >
              <BellIcon />
              {naoLidas > 0 && (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </button>

            {painelAberto && (
              <PainelNotificacoes
                notificacoes={notificacoes}
                naoLidas={naoLidas}
                onMarcarTodas={marcarTodas}
              />
            )}
          </div>

          {perfilPath ? (
            <Link
              to={perfilPath}
              className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 hover:bg-brand-100 hover:text-brand-700"
              title="Ver perfil"
            >
              {nome ? nome[0].toUpperCase() : '?'}
            </Link>
          ) : (
            <div
              className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600"
              title={nome}
            >
              {nome ? nome[0].toUpperCase() : '?'}
            </div>
          )}

          {perfilPath && (
            <Link
              to={perfilPath}
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 sm:block"
            >
              Ver perfil
            </Link>
          )}

          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
