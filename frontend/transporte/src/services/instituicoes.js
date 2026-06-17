import { api } from '../lib/apiClient'

// Instituições — InstituicaoSerializer: { id, nome, horario_inicio, horario_fim }
export const instituicoesService = {
  listar: () => api.get('/instituicoes/'),
}
