import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME_BY_ROLE } from '../config'
import Button from '../components/ui/Button'

// Tela de login única: após autenticar, redireciona para a home do papel.
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const { role } = await login(username.trim(), password)
      navigate(HOME_BY_ROLE[role] || '/', { replace: true })
    } catch (err) {
      setErro(err?.detail?.detail || err.message || 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">
            T
          </div>
          <h1 className="text-xl font-bold text-slate-800">Sistema de Transporte</h1>
          <p className="mt-1 text-sm text-slate-500">Entre com sua conta para continuar</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
