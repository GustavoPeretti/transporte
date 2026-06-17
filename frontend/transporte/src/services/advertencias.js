import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse } from '../mock/db'

// Advertências — AdvertenciaSerializer: { id, confirmacao, descricao, data }
// OBS: o campo `justificativa` não existe ainda no backend; PATCH
//      em /advertencias/{id}/ deverá ser adicionado quando disponível.
export const advertenciasService = {
  listar: () => (USE_MOCK ? mockResponse(db.advertencias) : api.get('/advertencias/')),

  async listarPorPassageiro(passageiroId) {
    const [advertencias, confirmacoes] = await Promise.all([
      USE_MOCK ? mockResponse(db.advertencias) : api.get('/advertencias/'),
      USE_MOCK ? mockResponse(db.confirmacoes) : api.get('/confirmacoes/'),
    ])
    const idsConfirmacao = confirmacoes
      .filter((c) => c.passageiro === passageiroId)
      .map((c) => c.id)
    return advertencias.filter((a) => idsConfirmacao.includes(a.confirmacao))
  },

  async justificar(id, justificativa) {
    if (USE_MOCK) {
      const a = db.advertencias.find((x) => x.id === id)
      if (a) a.justificativa = justificativa
      return mockResponse(a)
    }
    return api.patch(`/advertencias/${id}/`, { justificativa })
  },
}
