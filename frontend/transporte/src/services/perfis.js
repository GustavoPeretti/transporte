import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse } from '../mock/db'

// Perfis de motorista — PerfilMotoristaSerializer: { id, usuario, habilitacao }
export const perfisService = {
  listarMotoristas: () =>
    USE_MOCK ? mockResponse(db.perfisMotorista) : api.get('/perfis-motorista/'),
  listarPassageiros: () =>
    USE_MOCK ? mockResponse(db.perfisPassageiro) : api.get('/perfis-passageiro/'),
  listarUsuarios: () => (USE_MOCK ? mockResponse(db.usuarios) : api.get('/usuarios/')),
}
