import { api } from '../lib/apiClient'

export const perfisService = {
  listarMotoristas:  () => api.get('/perfis-motorista/'),
  listarPassageiros: () => api.get('/perfis-passageiro/'),
  listarUsuarios:    () => api.get('/usuarios/'),

  obterMotorista:  (id) => api.get(`/perfis-motorista/${id}/`),
  obterPassageiro: (id) => api.get(`/perfis-passageiro/${id}/`),
}
