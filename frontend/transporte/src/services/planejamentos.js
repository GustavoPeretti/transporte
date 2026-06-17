import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse } from '../mock/db'

// Planejamentos — PlanejamentoSerializer: { id, data, aberto }
export const planejamentosService = {
  listar: () => (USE_MOCK ? mockResponse(db.planejamentos) : api.get('/planejamentos/')),

  // Abre/fecha o planejamento de um dia (campo `aberto`).
  async definirAberto(id, aberto) {
    if (USE_MOCK) {
      const p = db.planejamentos.find((x) => x.id === id)
      if (p) p.aberto = aberto
      return mockResponse(p)
    }
    return api.patch(`/planejamentos/${id}/`, { aberto })
  },
}
