import { API_BASE_URL } from '../config'

// Cliente HTTP sobre fetch: base URL, headers, CSRF e erros para os serviços.
// Auth por cookie de sessão httpOnly (via `credentials: 'include'`); nenhum token em JS.

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

  // CSRF em todo método mutante (inclusive FormData).
  if (method !== 'GET' && method !== 'HEAD') {
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

  // Sessão ausente/expirada: limpa o estado local e volta ao login.
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
