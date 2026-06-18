import { api } from '../lib/apiClient'

// Confirmações — ConfirmacaoSerializer:
//   { id, passageiro, planejamento, ida, retorno, presenca_ida,
//     presenca_retorno, ultima_atualizacao }
export const confirmacoesService = {
  listar: () => api.get('/confirmacoes/'),

  listarPorPassageiro: (passageiroId) =>
    api.get(`/confirmacoes/?passageiro=${passageiroId}`),

  // Cria ou atualiza a confirmação de ida/volta de um passageiro num dia.
  salvar({ id, passageiro, planejamento, ida, retorno }) {
    if (id) {
      return api.patch(`/confirmacoes/${id}/`, { ida, retorno })
    }
    return api.post('/confirmacoes/', { passageiro, planejamento, ida, retorno })
  },

  registrarEmbarque({ data, idPassageiro, tipo }) {
    return api.post('/confirmacoes/registrar-embarque/', {
      data,
      id_passageiro: idPassageiro,
      tipo,
    })
  },
}
