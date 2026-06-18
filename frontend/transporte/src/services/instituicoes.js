import { api } from '../lib/apiClient'

export const instituicoesService = {
  listar: ()    => api.get('/instituicoes/'),
  obter:  (id)  => api.get(`/instituicoes/${id}/`),
}
