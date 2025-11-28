/**
 * 带认证的 useFetch 封装
 */
export function useAuthFetch<T>(url: string, options: any = {}) {
  const getToken = () => {
    if (import.meta.client) {
      return localStorage.getItem('loveday_token')
    }
    return null
  }

  const token = getToken()
  
  return useFetch<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

/**
 * 带认证的 $fetch 封装
 */
export async function authFetch<T>(url: string, options: any = {}): Promise<T> {
  const getToken = () => {
    if (import.meta.client) {
      return localStorage.getItem('loveday_token')
    }
    return null
  }

  const token = getToken()
  
  return $fetch<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
