const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Attempt to refresh the access token using the refresh token
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
      return data.accessToken
    }
    return null
  } catch {
    return null
  }
}

// Clear all auth data and redirect to login
export function logout(navigate, loginPath = '/login') {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  navigate(loginPath)
}

// Authenticated fetch — auto-refreshes token on 401, logs out if refresh fails
export async function authFetch(url, options = {}, navigate, loginPath = '/login') {
  const token = localStorage.getItem('accessToken')

  const makeRequest = (t) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    })

  let res = await makeRequest(token)

  if (res.status === 401) {
    // Try to refresh
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await makeRequest(newToken)
    } else {
      // Refresh failed — log out
      logout(navigate, loginPath)
      return null
    }
  }

  return res
}