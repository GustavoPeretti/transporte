import { api } from '../lib/apiClient'

export const notificacoesService = {
  listar:           () =>      api.get('/notificacoes/'),
  marcarTodasLidas: () =>      api.post('/notificacoes/marcar-todas-lidas/'),
}
