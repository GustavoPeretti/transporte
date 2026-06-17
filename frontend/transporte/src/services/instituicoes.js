import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse } from '../mock/db'

// Instituições — InstituicaoSerializer: { id, nome, horario_inicio, horario_fim }
export const instituicoesService = {
  listar: () => (USE_MOCK ? mockResponse(db.instituicoes) : api.get('/instituicoes/')),
}
