// Em dev o Vite faz proxy de /api e /media para o Django (same-origin, sem CORS).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
