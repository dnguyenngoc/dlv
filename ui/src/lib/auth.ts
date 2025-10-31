export function getToken(): string | null {
  return localStorage.getItem('dlv_token')
}

export function setToken(token: string): void {
  localStorage.setItem('dlv_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('dlv_token')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) {
    // Auto-redirect to login on unauthorized
    clearToken()
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
  return res
}
