import { ROLES } from '../config'
import { api } from '../lib/apiClient'

// Autenticação.
//
// O backend ainda NÃO expõe endpoint de login/token nem campo de papel.
// Enquanto isso, resolvemos o usuário pelo `username` na lista real de usuários
// e derivamos o papel a partir dos perfis (motorista/passageiro/admin).
// A senha ainda não é validada — quando o backend tiver autenticação (ex.: DRF
// authtoken), trocar `login` para POST /auth/token/ e guardar o token.
async function login(username /*, password */) {
  const usuarios = await api.get('/usuarios/')
  const usuario = usuarios.find((u) => u.username === username)
  if (!usuario) {
    const erro = new Error('Usuário não encontrado.')
    erro.status = 401
    throw erro
  }
  const sessao = await resolverPapel(usuario.id)
  return { usuario, ...sessao }
}

// Deriva o papel a partir dos perfis existentes; sem perfil = administrador.
async function resolverPapel(usuarioId) {
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

export const authService = { login }
