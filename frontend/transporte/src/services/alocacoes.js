import { api } from '../lib/apiClient'

// Alocações de veículo — AlocacaoVeiculoSerializer:
//   { id, planejamento, motorista, veiculo, embarque }
// Alocações de instituição — AlocacaoInstituicaoSerializer:
//   { id, alocacao_veiculo, instituicao }
export const alocacoesService = {
  listarVeiculos: () => api.get('/alocacoes-veiculo/'),
  listarInstituicoes: () => api.get('/alocacoes-instituicao/'),

  criarVeiculo: (payload) => api.post('/alocacoes-veiculo/', payload),
  removerVeiculo: (id) => api.delete(`/alocacoes-veiculo/${id}/`),

  criarInstituicao: (payload) => api.post('/alocacoes-instituicao/', payload),
  removerInstituicao: (id) => api.delete(`/alocacoes-instituicao/${id}/`),
}
