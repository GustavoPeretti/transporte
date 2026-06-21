import { API_BASE_URL } from '../config'

// Cliente HTTP fino sobre o fetch, centralizando base URL, headers,
// CSRF e tratamento de erros para toda a camada de serviços.
//
// Autenticação é por cookie de sessão httpOnly (enviado automaticamente via
// `credentials: 'include'`). Nenhum token trafega/é guardado em JavaScript.

function getCsrfToken() {
  const match = document.cookie.match(/(^|;)\s*csrftoken=([^;]+)/)
  return match ? match[2] : null
}

async function ensureCsrfToken() {
  const csrfToken = getCsrfToken()
  if (csrfToken) return csrfToken
  await fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: 'GET',
    credentials: 'include',
  })
  return getCsrfToken()
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const isFormData = body instanceof FormData
  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  }

  if (method !== 'GET' && method !== 'HEAD' && !isFormData) {
    const csrfToken = await ensureCsrfToken()
    if (csrfToken) {
      defaultHeaders['X-CSRFToken'] = csrfToken
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: defaultHeaders,
    body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
  })

  // Sessão ausente/expirada (ex.: sessão antiga em localStorage de antes da
  // migração de auth): limpa o estado local e volta ao login, evitando a
  // sensação de "tela logada que não salva nada".
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('auth_session')
    if (!window.location.pathname.startsWith('/login')) {
      window.location.replace('/login')
    }
  }

  if (!res.ok) {
    let detail
    try {
      detail = await res.json()
    } catch {
      detail = await res.text()
    }
    const error = new Error(`Erro ${res.status} ao acessar ${path}`)
    error.status = res.status
    error.detail = detail
    throw error
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
