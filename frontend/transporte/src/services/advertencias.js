import { api } from '../lib/apiClient'

// Advertências — AdvertenciaSerializer: { id, confirmacao, descricao, data }
export const advertenciasService = {
  listar: () => api.get('/advertencias/'),

  // Advertências de um passageiro, cruzando com as confirmações dele.
  async listarPorPassageiro(passageiroId) {
    const [advertencias, confirmacoes] = await Promise.all([
      api.get('/advertencias/'),
      api.get('/confirmacoes/'),
    ])
    const idsConfirmacao = confirmacoes
      .filter((c) => c.passageiro === passageiroId)
      .map((c) => c.id)
    return advertencias.filter((a) => idsConfirmacao.includes(a.confirmacao))
  },

  // OBS(backend): o modelo Advertencia ainda não possui o campo `justificativa`.
  // Enquanto não for adicionado ao modelo + serializer, este PATCH não persiste.
  justificar: (id, justificativa) => api.patch(`/advertencias/${id}/`, { justificativa }),
}
