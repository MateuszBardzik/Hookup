/**
 * Small wrapper around fetch() for talking to the Django API.
 *  - adds the "Authorization: Token ..." header when logged in
 *  - turns error responses into an ApiError with per-field messages
 */

const TOKEN_KEY = 'engivexlab.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable (private mode): stay logged in for this tab only */
  }
}

/** Error thrown for any non-2xx response. */
export class ApiError extends Error {
  status: number
  /** e.g. { email: "An account with this email already exists." } */
  fieldErrors: Record<string, string>
  /** Machine-readable reason sent by the back-end, e.g. "email_not_verified" ('' if none). */
  code: string

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}, code = '') {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
    this.code = code
  }
}

// Django REST Framework sends errors like
//   {"detail": "..."}  or  {"email": ["..."], "non_field_errors": ["..."]}
function parseError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object') {
    const data = body as Record<string, unknown>
    if (typeof data.detail === 'string')
      return new ApiError(status, data.detail, {}, typeof data.code === 'string' ? data.code : '')

    const fieldErrors: Record<string, string> = {}
    let message = ''
    for (const [key, value] of Object.entries(data)) {
      const text = Array.isArray(value) ? value.join(' ') : String(value)
      if (key === 'non_field_errors') message = text
      else fieldErrors[key] = text
    }
    return new ApiError(status, message || 'Please check the highlighted fields.', fieldErrors)
  }
  return new ApiError(status, 'Something went wrong. Please try again.')
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

/**
 * Call the API. `body` can be a plain object (sent as JSON) or FormData
 * (sent as multipart, used for file uploads).
 */
export async function api<T>(path: string, method: Method = 'GET', body?: object | FormData): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Token ${token}`

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body // browser sets the multipart Content-Type itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`/api${path}`, { method, headers, body: payload })

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) throw parseError(res.status, data)
  return data as T
}
