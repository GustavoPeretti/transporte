import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME_BY_ROLE } from '../config'
import Spinner from './ui/Spinner'

// Protege rotas por autenticação e (opcionalmente) por papel.
// Se o papel não for permitido, redireciona para a home do papel atual.
export default function ProtectedRoute({ children, roles }) {
  const { autenticado, role, carregando } = useAuth()

  if (carregando) return <Spinner />
  if (!autenticado) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />
  }
  return children
}
