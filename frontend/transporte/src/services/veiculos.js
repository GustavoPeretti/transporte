import { USE_MOCK } from '../config'
import { api } from '../lib/apiClient'
import { db, mockResponse } from '../mock/db'

// Veículos — VeiculoSerializer: { id, placa, capacidade, modelo, tipo }
export const veiculosService = {
  listar: () => (USE_MOCK ? mockResponse(db.veiculos) : api.get('/veiculos/')),
}

export const TIPO_VEICULO_LABEL = {
  ONIBUS: 'Ônibus',
  VAN: 'Van',
  MICROONIBUS: 'Microônibus',
}
