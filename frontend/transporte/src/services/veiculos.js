import { api } from '../lib/apiClient'

// Veículos — VeiculoSerializer: { id, placa, capacidade, modelo, tipo }
export const veiculosService = {
  listar: () => api.get('/veiculos/'),
}

export const TIPO_VEICULO_LABEL = {
  ONIBUS: 'Ônibus',
  VAN: 'Van',
  MICROONIBUS: 'Microônibus',
}
