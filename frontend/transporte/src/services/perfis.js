import { api } from '../lib/apiClient'

// Perfis e usuários.
//   PerfilMotorista:  { id, usuario, habilitacao }
//   PerfilPassageiro: { id, usuario, instituicao, comprovante_matricula }
//   Usuario:          { id, username, email, first_name, last_name, cpf }
export const perfisService = {
  listarMotoristas: () => api.get('/perfis-motorista/'),
  listarPassageiros: () => api.get('/perfis-passageiro/'),
  listarUsuarios: () => api.get('/usuarios/'),
}
