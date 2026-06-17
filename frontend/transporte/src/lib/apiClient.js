import { API_BASE_URL } from '../config'

// Cliente HTTP fino sobre o fetch, centralizando base URL, headers,
// token de autenticação e tratamento de erros para toda a camada de serviços.

function authHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Token ${token}` } : {}
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const isFormData = body instanceof FormData
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...headers,
    },
    body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
  })

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
