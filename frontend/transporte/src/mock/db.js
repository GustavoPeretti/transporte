// Base de dados em memória para desenvolvimento (USE_MOCK = true).
// A forma de cada registro espelha exatamente os serializers do backend,
// para que a troca para a API real seja transparente.

import { ROLES } from '../config'
import { toISODate, weekDays } from '../lib/dates'

const today = new Date()
const semana = weekDays(today) // domingo..sábado da semana atual
const isoDe = (i) => toISODate(semana[i])

// --- Usuários (espelha UsuarioSerializer) ---------------------------------
export const usuarios = [
  { id: 1, username: 'admin', email: 'admin@transporte.dev', first_name: 'Ana', last_name: 'Gestora', cpf: '000.000.000-00' },
  { id: 2, username: 'motorista', email: 'motorista@transporte.dev', first_name: 'Carlos', last_name: 'Silva', cpf: '111.111.111-11' },
  { id: 3, username: 'passageiro', email: 'passageiro@transporte.dev', first_name: 'Beatriz', last_name: 'Souza', cpf: '222.222.222-22' },
  { id: 4, username: 'joao', email: 'joao@transporte.dev', first_name: 'João', last_name: 'Pereira', cpf: '333.333.333-33' },
]

// Credenciais simuladas + papel de cada usuário (somente no mock).
export const credenciais = {
  admin: { senha: 'admin', role: ROLES.ADMIN, usuarioId: 1 },
  motorista: { senha: 'motorista', role: ROLES.MOTORISTA, usuarioId: 2, perfilMotoristaId: 1 },
  passageiro: { senha: 'passageiro', role: ROLES.PASSAGEIRO, usuarioId: 3, perfilPassageiroId: 1 },
}

// --- Instituições (InstituicaoSerializer) ---------------------------------
export const instituicoes = [
  { id: 1, nome: 'IFC', horario_inicio: '07:30:00', horario_fim: '17:45:00' },
  { id: 2, nome: 'Senac', horario_inicio: '08:00:00', horario_fim: '18:00:00' },
  { id: 3, nome: 'UDESC', horario_inicio: '07:00:00', horario_fim: '18:30:00' },
]

// --- Veículos (VeiculoSerializer) -----------------------------------------
export const veiculos = [
  { id: 1, placa: 'ABC1D23', capacidade: 30, modelo: 'Marcopolo Volare', tipo: 'ONIBUS' },
  { id: 2, placa: 'EFG4H56', capacidade: 1, modelo: 'Honda CG', tipo: 'VAN' },
  { id: 3, placa: 'IJK7L89', capacidade: 18, modelo: 'Sprinter', tipo: 'MICROONIBUS' },
]

// --- Perfis ---------------------------------------------------------------
export const perfisMotorista = [
  { id: 1, usuario: 2, habilitacao: 'AD' },
  { id: 2, usuario: 4, habilitacao: 'D' },
]

export const perfisPassageiro = [
  { id: 1, usuario: 3, instituicao: 1, comprovante_matricula: null, matricula_valida: true },
]

// --- Planejamentos da semana atual (PlanejamentoSerializer) ---------------
// Um planejamento por dia da semana. `aberto` controla se aceita confirmações.
export const planejamentos = semana.map((_, i) => ({
  id: i + 1,
  data: isoDe(i),
  aberto: i !== 0 && i !== 6, // fim de semana fechado por padrão
}))

const planejamentoIdPorIndice = (i) => planejamentos[i].id

// --- Alocações de veículo (AlocacaoVeiculoSerializer) ----------------------
export const alocacoesVeiculo = [
  { id: 1, planejamento: planejamentoIdPorIndice(2), motorista: 1, veiculo: 1, embarque: '17:45:00' },
  { id: 2, planejamento: planejamentoIdPorIndice(2), motorista: 2, veiculo: 2, embarque: '18:00:00' },
]

// --- Alocações de instituição (AlocacaoInstituicaoSerializer) --------------
export const alocacoesInstituicao = [
  { id: 1, alocacao_veiculo: 1, instituicao: 1 },
  { id: 2, alocacao_veiculo: 1, instituicao: 2 },
]

// --- Confirmações (ConfirmacaoSerializer) ---------------------------------
// Confirmações da passageira Beatriz (perfil 1) ao longo da semana.
export const confirmacoes = [
  { id: 1, passageiro: 1, planejamento: planejamentoIdPorIndice(1), ida: true, retorno: true, presenca_ida: false, presenca_retorno: false, ultima_atualizacao: new Date().toISOString() },
  { id: 2, passageiro: 1, planejamento: planejamentoIdPorIndice(2), ida: true, retorno: false, presenca_ida: false, presenca_retorno: false, ultima_atualizacao: new Date().toISOString() },
  { id: 3, passageiro: 1, planejamento: planejamentoIdPorIndice(3), ida: true, retorno: true, presenca_ida: false, presenca_retorno: false, ultima_atualizacao: new Date().toISOString() },
]

// --- Advertências (AdvertenciaSerializer) ---------------------------------
export const advertencias = [
  { id: 1, confirmacao: 2, descricao: 'Não compareceu ao embarque de retorno.', data: isoDe(2), justificativa: null },
]

// Estado mutável compartilhado entre os serviços mock.
export const db = {
  usuarios,
  credenciais,
  instituicoes,
  veiculos,
  perfisMotorista,
  perfisPassageiro,
  planejamentos,
  alocacoesVeiculo,
  alocacoesInstituicao,
  confirmacoes,
  advertencias,
}

// Simula latência de rede e devolve uma cópia para evitar mutação acidental.
export function mockResponse(data, ms = 250) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms)
  })
}

export function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
