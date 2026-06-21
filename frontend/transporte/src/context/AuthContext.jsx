import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)
const STORAGE_KEY = 'auth_session'

function carregarSessaoInicial() {
  const bruto = localStorage.getItem(STORAGE_KEY)
  if (!bruto) return null
  try {
    return JSON.parse(bruto)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(carregarSessaoInicial)

  const login = useCallback(async (username, password) => {
    const dados = await authService.login(username, password)
    // A credencial real é o cookie de sessão httpOnly. Aqui guardamos apenas
    // dados não sensíveis (papel/perfil) para reidratar a UI ao recarregar.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
    setSessao(dados)
    return dados
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    localStorage.removeItem(STORAGE_KEY)
    setSessao(null)
  }, [])

  const valor = useMemo(
    () => ({
      sessao,
      usuario: sessao?.usuario ?? null,
      role: sessao?.role ?? null,
      autenticado: Boolean(sessao),
      carregando: false,
      login,
      logout,
    }),
    [sessao, login, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}
