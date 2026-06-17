import { USE_MOCK, ROLES } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse } from '../mock/db'

// Autenticação.
//
// Mock: valida contra as credenciais simuladas e devolve usuário + papel.
// Real: o backend ainda NÃO expõe endpoint de login/token nem campo de papel.
// Quando expuser, ajustar `loginReal`/`carregarSessaoReal` abaixo (ex.: usar
// rest_framework.authtoken em /api/auth/token/ e um endpoint /api/me/).

function login(username, password) {
  return USE_MOCK ? loginMock(username, password) : loginReal(username, password)
}

async function loginMock(username, password) {
  await mockResponse(null, 300)
  const cred = db.credenciais[username]
  if (!cred || cred.senha !== password) {
    const erro = new Error('Usuário ou senha inválidos.')
    erro.status = 401
    throw erro
  }
  const usuario = db.usuarios.find((u) => u.id === cred.usuarioId)
  return {
    token: `mock-token-${username}`,
    role: cred.role,
    usuario,
    perfilMotoristaId: cred.perfilMotoristaId ?? null,
    perfilPassageiroId: cred.perfilPassageiroId ?? null,
  }
}

// eslint-disable-next-line no-unused-vars
async function loginReal(username, password) {
  // TODO(backend): criar endpoint de autenticação (ex.: DRF authtoken).
  // const { token } = await api.post('/auth/token/', { username, password })
  // localStorage.setItem('auth_token', token)
  // return carregarSessaoReal()
  throw new Error('Login real ainda não disponível: backend sem endpoint de autenticação.')
}

// Deriva o papel a partir dos perfis existentes (motorista/passageiro) ou staff.
async function carregarSessaoReal(usuarioId) {
  const [motoristas, passageiros] = await Promise.all([
    api.get('/perfis-motorista/'),
    api.get('/perfis-passageiro/'),
  ])
  const motorista = motoristas.find((p) => p.usuario === usuarioId)
  const passageiro = passageiros.find((p) => p.usuario === usuarioId)
  return {
    role: motorista ? ROLES.MOTORISTA : passageiro ? ROLES.PASSAGEIRO : ROLES.ADMIN,
    perfilMotoristaId: motorista?.id ?? null,
    perfilPassageiroId: passageiro?.id ?? null,
  }
}

export const authService = { login, carregarSessaoReal }
