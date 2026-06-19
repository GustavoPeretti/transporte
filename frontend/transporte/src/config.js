// Configurações globais do frontend.
//
// Em desenvolvimento, o Vite faz proxy de /api e /media para o backend Django
// (ver vite.config.js), então as chamadas são same-origin e não exigem CORS.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Papéis de usuário usados no roteamento e na exibição das telas.
export const ROLES = {
  ADMIN: 'admin',
  MOTORISTA: 'motorista',
  PASSAGEIRO: 'passageiro',
}

// Rota inicial de cada papel após o login.
export const HOME_BY_ROLE = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.MOTORISTA]: '/motorista',
  [ROLES.PASSAGEIRO]: '/passageiro',
}
