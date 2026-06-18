import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import { api } from '../../../lib/apiClient'

const TIPO_MOTORISTA = 'motorista'
const TIPO_PASSAGEIRO = 'passageiro'

const camposBase = [
  { name: 'first_name', label: 'Nome',       type: 'text' },
  { name: 'last_name',  label: 'Sobrenome',  type: 'text' },
  { name: 'username',   label: 'Usuário',    type: 'text' },
  { name: 'password',   label: 'Senha',      type: 'password' },
  { name: 'email',      label: 'E-mail',     type: 'email' },
  { name: 'cpf',        label: 'CPF',        type: 'text' },
]

function estadoInicial() {
  return {
    first_name: '', last_name: '', username: '', password: '',
    email: '', cpf: '', habilitacao: '', instituicao: '', comprovante: null,
  }
}

export default function CriarUsuarioModal({ open, onClose, instituicoes, onCriado }) {
  const [tipo, setTipo] = useState(TIPO_MOTORISTA)
  const [form, setForm] = useState(estadoInicial)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function handleChange(e) {
    const { name, value, files } = e.target
    if (name === 'comprovante') {
      setForm((f) => ({ ...f, comprovante: files[0] ?? null }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  function trocarTipo(novoTipo) {
    setTipo(novoTipo)
    setErro('')
  }

  async function salvar() {
    setErro('')
    setSalvando(true)
    try {
      if (tipo === TIPO_MOTORISTA) {
        await api.post('/usuarios/criar-motorista/', {
          first_name: form.first_name,
          last_name: form.last_name,
          username: form.username,
          password: form.password,
          email: form.email,
          cpf: form.cpf,
          habilitacao: form.habilitacao,
        })
      } else {
        const body = new FormData()
        body.append('first_name', form.first_name)
        body.append('last_name', form.last_name)
        body.append('username', form.username)
        body.append('password', form.password)
        body.append('email', form.email)
        body.append('cpf', form.cpf)
        body.append('instituicao', form.instituicao)
        if (form.comprovante) body.append('comprovante_matricula', form.comprovante)
        await api.post('/usuarios/criar-passageiro/', body)
      }
      onCriado()
      onClose()
      setForm(estadoInicial())
    } catch (err) {
      setErro(err?.detail?.erro || 'Erro ao criar usuário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar usuário"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Criar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Seletor de tipo */}
        <div className="flex gap-2 rounded-xl border border-slate-200 p-1">
          {[TIPO_MOTORISTA, TIPO_PASSAGEIRO].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => trocarTipo(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                tipo === t
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === TIPO_MOTORISTA ? 'Motorista' : 'Passageiro'}
            </button>
          ))}
        </div>

        {/* Campos comuns */}
        <div className="grid grid-cols-2 gap-3">
          {camposBase.map(({ name, label, type }) => (
            <Campo key={name} label={label} className={name === 'email' ? 'col-span-2' : ''}>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </Campo>
          ))}
        </div>

        {/* Campo específico por tipo */}
        {tipo === TIPO_MOTORISTA ? (
          <Campo label="Habilitação">
            <input
              name="habilitacao"
              type="text"
              value={form.habilitacao}
              onChange={handleChange}
              placeholder="Ex: AB, D, E"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </Campo>
        ) : (
          <>
            <Campo label="Instituição">
              <select
                name="instituicao"
                value={form.instituicao}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {instituicoes.map((i) => (
                  <option key={i.id} value={i.id}>{i.nome}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Comprovante de matrícula (opcional)">
              <input
                name="comprovante"
                type="file"
                onChange={handleChange}
                className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
            </Campo>
          </>
        )}

        {erro && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
        )}
      </div>
    </Modal>
  )
}

function Campo({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}
