// Configurações globais do frontend.
//
// USE_MOCK: enquanto o backend ainda não expõe login/CORS, a aplicação roda
// com dados simulados (camada em src/mock). Quando o backend estiver pronto,
// basta trocar para `false` (ou definir VITE_USE_MOCK=false) que toda a camada
// de serviços passa a consumir a API real em /api.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK
  ? import.meta.env.VITE_USE_MOCK === 'true'
  : true

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Papéis de usuário usados no roteamento e na exibição das telas.
export const ROLES = {
  ADMIN: 'admin',
  MOTORISTA: 'motorista',
  PASSAGEIRO: 'passageiro',
}

// Rota inicial de cada papel após o login.
export const HOME_BY_ROLE = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.MOTORISTA]: '/motorista',
  [ROLES.PASSAGEIRO]: '/passageiro',
}
