import { api } from '../lib/apiClient'

// Autenticação por sessão (cookie httpOnly).
// O backend grava o cookie de sessão httpOnly — inacessível a JavaScript e,
// portanto, resistente a roubo via XSS. Nenhum token é guardado no front.
async function login(username, password) {
  // Retorna { usuario, role, perfilMotoristaId, perfilPassageiroId }.
  return api.post('/auth/login/', { username, password })
}

async function logout() {
  // Encerra a sessão no servidor (invalida o cookie). Falha é tolerável.
  try {
    await api.post('/auth/logout/')
  } catch {
    /* ignora: a limpeza local acontece de qualquer forma */
  }
}

export const authService = { login, logout }
