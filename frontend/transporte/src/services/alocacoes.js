import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse, nextId } from '../mock/db'

// Alocações de veículo — AlocacaoVeiculoSerializer:
//   { id, planejamento, motorista, veiculo, embarque }
// Alocações de instituição — AlocacaoInstituicaoSerializer:
//   { id, alocacao_veiculo, instituicao }
export const alocacoesService = {
  listarVeiculos: () =>
    USE_MOCK ? mockResponse(db.alocacoesVeiculo) : api.get('/alocacoes-veiculo/'),

  listarInstituicoes: () =>
    USE_MOCK ? mockResponse(db.alocacoesInstituicao) : api.get('/alocacoes-instituicao/'),

  async criarVeiculo(payload) {
    if (USE_MOCK) {
      const novo = { id: nextId(db.alocacoesVeiculo), ...payload }
      db.alocacoesVeiculo.push(novo)
      return mockResponse(novo)
    }
    return api.post('/alocacoes-veiculo/', payload)
  },

  async removerVeiculo(id) {
    if (USE_MOCK) {
      const i = db.alocacoesVeiculo.findIndex((a) => a.id === id)
      if (i >= 0) db.alocacoesVeiculo.splice(i, 1)
      // remove também as alocações de instituição vinculadas
      db.alocacoesInstituicao = db.alocacoesInstituicao.filter((a) => a.alocacao_veiculo !== id)
      return mockResponse(null)
    }
    return api.delete(`/alocacoes-veiculo/${id}/`)
  },

  async criarInstituicao(payload) {
    if (USE_MOCK) {
      const novo = { id: nextId(db.alocacoesInstituicao), ...payload }
      db.alocacoesInstituicao.push(novo)
      return mockResponse(novo)
    }
    return api.post('/alocacoes-instituicao/', payload)
  },

  async removerInstituicao(id) {
    if (USE_MOCK) {
      const i = db.alocacoesInstituicao.findIndex((a) => a.id === id)
      if (i >= 0) db.alocacoesInstituicao.splice(i, 1)
      return mockResponse(null)
    }
    return api.delete(`/alocacoes-instituicao/${id}/`)
  },
}
