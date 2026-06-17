import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse, nextId } from '../mock/db'

// Confirmações — ConfirmacaoSerializer:
//   { id, passageiro, planejamento, ida, retorno, presenca_ida,
//     presenca_retorno, ultima_atualizacao }
export const confirmacoesService = {
  listar: () => (USE_MOCK ? mockResponse(db.confirmacoes) : api.get('/confirmacoes/')),

  async listarPorPassageiro(passageiroId) {
    if (USE_MOCK) {
      return mockResponse(db.confirmacoes.filter((c) => c.passageiro === passageiroId))
    }
    const todas = await api.get('/confirmacoes/')
    return todas.filter((c) => c.passageiro === passageiroId)
  },

  // Cria ou atualiza a confirmação de um passageiro em um planejamento.
  async salvar({ id, passageiro, planejamento, ida, retorno }) {
    if (USE_MOCK) {
      let registro = id ? db.confirmacoes.find((c) => c.id === id) : null
      if (!registro) {
        registro = {
          id: nextId(db.confirmacoes),
          passageiro,
          planejamento,
          ida,
          retorno,
          presenca_ida: false,
          presenca_retorno: false,
          ultima_atualizacao: new Date().toISOString(),
        }
        db.confirmacoes.push(registro)
      } else {
        Object.assign(registro, { ida, retorno, ultima_atualizacao: new Date().toISOString() })
      }
      return mockResponse(registro)
    }
    const payload = { passageiro, planejamento, ida, retorno, presenca_ida: false, presenca_retorno: false }
    return id ? api.patch(`/confirmacoes/${id}/`, payload) : api.post('/confirmacoes/', payload)
  },

  // Motorista registra presença (embarque) de uma confirmação.
  async registrarPresenca(id, { presenca_ida, presenca_retorno }) {
    if (USE_MOCK) {
      const c = db.confirmacoes.find((x) => x.id === id)
      if (c) {
        if (presenca_ida != null) c.presenca_ida = presenca_ida
        if (presenca_retorno != null) c.presenca_retorno = presenca_retorno
        c.ultima_atualizacao = new Date().toISOString()
      }
      return mockResponse(c)
    }
    const patch = {}
    if (presenca_ida != null) patch.presenca_ida = presenca_ida
    if (presenca_retorno != null) patch.presenca_retorno = presenca_retorno
    return api.patch(`/confirmacoes/${id}/`, patch)
  },
}
