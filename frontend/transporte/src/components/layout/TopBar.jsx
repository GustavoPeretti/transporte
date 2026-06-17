import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../config'

const ROLE_LABEL = {
  admin: 'Administrador',
  motorista: 'Motorista',
  passageiro: 'Passageiro',
}

const PERFIL_PATH = {
  [ROLES.MOTORISTA]: '/motorista/perfil',
  [ROLES.PASSAGEIRO]: '/passageiro/perfil',
}

export default function TopBar({ title }) {
  const { usuario, role, logout } = useAuth()
  const nome = usuario ? `${usuario.first_name} ${usuario.last_name}`.trim() : ''
  const perfilPath = PERFIL_PATH[role] ?? null

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
