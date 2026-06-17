import { ROLES } from '../config'
import { api } from '../lib/apiClient'

// Autenticação usando DRF TokenAuthentication.
// Faz login com credenciais e obtém um token válido para chamadas subsequentes.
// Depois de obter o token, buscamos o usuário atual e seu papel no backend.
async function login(username, password) {
  const tokenResponse = await api.post('/auth/token/', {
    username,
    password,
  })

  if (!tokenResponse?.token) {
    const erro = new Error('Falha ao autenticar.')
    erro.status = 401
    throw erro
  }

  localStorage.setItem('auth_token', tokenResponse.token)
  const me = await api.get('/auth/me/')
  return { token: tokenResponse.token, ...me }
}

export const authService = { login }
