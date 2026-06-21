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

  // Registra presença. Pelo QR, envia o token assinado (`qrToken`); na marcação
  // manual pelo motorista, envia o id do passageiro.
  registrarEmbarque({ data, idPassageiro, qrToken, tipo }) {
    const body = { data, tipo }
    if (qrToken) body.qr_token = qrToken
    else body.id_passageiro = idPassageiro
    return api.post('/confirmacoes/registrar-embarque/', body)
  },
}
