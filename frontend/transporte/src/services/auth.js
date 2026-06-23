import { api } from '../lib/apiClient'

// Auth por sessão: o backend grava um cookie httpOnly (resistente a XSS); nada fica em JS.

// Retorna { usuario, role, perfilMotoristaId, perfilPassageiroId }.
async function login(username, password) {
  return api.post('/auth/login/', { username, password })
}

async function logout() {
  // Invalida o cookie no servidor; a limpeza local acontece mesmo se falhar.
  try {
    await api.post('/auth/logout/')
  } catch {
    /* ignora */
  }
}

export const authService = { login, logout }
