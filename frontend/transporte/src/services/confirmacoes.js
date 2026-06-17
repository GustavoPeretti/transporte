import { api } from '../lib/apiClient'

// Confirmações — ConfirmacaoSerializer:
//   { id, passageiro, planejamento, ida, retorno, presenca_ida,
//     presenca_retorno, ultima_atualizacao }
export const confirmacoesService = {
  listar: () => api.get('/confirmacoes/'),

  async listarPorPassageiro(passageiroId) {
    const todas = await api.get('/confirmacoes/')
    return todas.filter((c) => c.passageiro === passageiroId)
  },

  // Cria ou atualiza a confirmação de ida/volta de um passageiro num dia.
  // Na criação enviamos presenças como false (campos obrigatórios no modelo);
  // na atualização só mexemos em ida/retorno para não resetar presenças.
  salvar({ id, passageiro, planejamento, ida, retorno }) {
    if (id) {
      return api.patch(`/confirmacoes/${id}/`, { ida, retorno })
    }
    return api.post('/confirmacoes/', {
      passageiro,
      planejamento,
      ida,
      retorno,
      presenca_ida: false,
      presenca_retorno: false,
    })
  },

  // Rota especial: registra o embarque (presença) de um passageiro.
  //   body: { data: 'YYYY-MM-DD', id_passageiro, tipo: 'ida' | 'retorno' }
  //   200 -> { status: 'OK' }; erros lógicos vêm como 4xx com { status: <NOME> }.
  registrarEmbarque({ data, idPassageiro, tipo }) {
    return api.post('/confirmacoes/registrar-embarque/', {
      data,
      id_passageiro: idPassageiro,
      tipo,
    })
  },
}
