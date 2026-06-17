import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { HOME_BY_ROLE, ROLES } from './config'
import ProtectedRoute from './components/ProtectedRoute'
import Spinner from './components/ui/Spinner'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import MotoristaPage from './pages/motorista/MotoristaPage'
import PerfilMotoristaPage from './pages/motorista/PerfilMotoristaPage'
import PassageiroPage from './pages/passageiro/PassageiroPage'
import PerfilPassageiroPage from './pages/passageiro/PerfilPassageiroPage'

// Redireciona a raiz para a home do papel autenticado (ou login).
function RootRedirect() {
  const { autenticado, role, carregando } = useAuth()
  if (carregando) return <Spinner />
  if (!autenticado) return <Navigate to="/login" replace />
  return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/motorista"
        element={
          <ProtectedRoute roles={[ROLES.MOTORISTA]}>
            <MotoristaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/motorista/perfil"
        element={
          <ProtectedRoute roles={[ROLES.MOTORISTA]}>
            <PerfilMotoristaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passageiro"
        element={
          <ProtectedRoute roles={[ROLES.PASSAGEIRO]}>
            <PassageiroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passageiro/perfil"
        element={
          <ProtectedRoute roles={[ROLES.PASSAGEIRO]}>
            <PerfilPassageiroPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
