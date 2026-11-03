const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type ApiOptions = { method?: string; body?: unknown }
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET', credentials: 'include',
    headers: options.body === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(data.error || `Falha na API (${response.status}).`)
  return data
}
