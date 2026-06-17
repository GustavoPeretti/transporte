import { api } from '../lib/apiClient'

// Planejamentos — PlanejamentoSerializer: { id, data, aberto }
export const planejamentosService = {
  listar: () => api.get('/planejamentos/'),

  // Abre/fecha o planejamento de um dia (campo `aberto`).
  definirAberto: (id, aberto) => api.patch(`/planejamentos/${id}/`, { aberto }),

  // Rota especial: organiza automaticamente as alocações do planejamento
  // (algoritmo de bin packing no backend). Retorna { status: <NOME> }.
  organizar: (id) => api.post(`/planejamentos/${id}/organizar/`),
}
