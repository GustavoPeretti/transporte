import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { perfisService } from '../../../services/perfis'

export default function GerenciarUsuariosModal({
  open,
  onClose,
  usuarios,
  perfisMotorista,
  perfisPassageiro,
  onDeletado,
}) {
  const [deletando, setDeletando] = useState(null)
  const [erro, setErro] = useState('')

  function tipoUsuario(usuarioId) {
    if (perfisMotorista.some((p) => p.usuario === usuarioId)) return 'motorista'
    if (perfisPassageiro.some((p) => p.usuario === usuarioId)) return 'passageiro'
    return 'admin'
  }

  async function deletar(id) {
    setDeletando(id)
    setErro('')
    try {
      await perfisService.deletarUsuario(id)
      onDeletado(id)
    } catch {
      setErro('Erro ao deletar usuário.')
    } finally {
      setDeletando(null)
    }
  }

  const usuariosVisiveis = usuarios.filter((u) => !u.is_superuser)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gerenciar usuários"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {erro && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
      )}

      {usuariosVisiveis.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum usuário cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {usuariosVisiveis.map((u) => {
            const tipo = tipoUsuario(u.id)
            return (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {u.first_name} {u.last_name}
                  </p>
                  <p className="text-xs text-slate-400">@{u.username}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge color={tipo === 'motorista' ? 'brand' : tipo === 'passageiro' ? 'green' : 'gray'}>
                    {tipo}
                  </Badge>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deletando === u.id}
                    onClick={() => deletar(u.id)}
                  >
                    {deletando === u.id ? '...' : 'Deletar'}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
