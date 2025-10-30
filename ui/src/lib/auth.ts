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
  return fetch(input, { ...init, headers })
}
