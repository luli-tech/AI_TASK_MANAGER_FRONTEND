type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface RequestConfig {
  method?: RequestMethod
  headers?: Record<string, string>
  body?: unknown
  cache?: RequestCache
  retries?: number
  retryDelay?: number
  skipAuth?: boolean
}

interface ApiResponse<T> {
  data: T
  status: number
  ok: boolean
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>
type ErrorInterceptor = (error: Error) => void

// Token management
const TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

class ApiClient {
  private baseUrl: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map()
  private cacheDuration = 5 * 60 * 1000 // 5 minutes
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
  }

  private getCacheKey(url: string, config: RequestConfig): string {
    return `${config.method || "GET"}-${url}-${JSON.stringify(config.body || {})}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: unknown) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        this.isRefreshing = false
        return false
      }

      try {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })

        if (response.ok) {
          const data = await response.json()
          setTokens(data.access_token, data.refresh_token)
          this.isRefreshing = false
          return true
        }
      } catch (error) {
        console.error("[API] Failed to refresh token:", error)
      }

      clearTokens()
      this.isRefreshing = false
      return false
    })()

    return this.refreshPromise
  }

  async request<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    let processedConfig = { ...config, method: config.method || "GET" }

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    // Add auth token if not skipped
    if (!processedConfig.skipAuth) {
      const token = getAccessToken()
      if (token) {
        processedConfig.headers = {
          ...processedConfig.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    }

    // Check cache for GET requests
    const cacheKey = this.getCacheKey(url, processedConfig)
    if (processedConfig.method === "GET") {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        return { data: cached, status: 200, ok: true }
      }
    }

    const retries = config.retries || 3
    const retryDelay = config.retryDelay || 1000
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${url}`, {
          method: processedConfig.method,
          headers: {
            "Content-Type": "application/json",
            ...processedConfig.headers,
          },
          body: processedConfig.body ? JSON.stringify(processedConfig.body) : undefined,
          cache: processedConfig.cache,
        })

        // Handle 401 - try to refresh token
        if (response.status === 401 && !processedConfig.skipAuth) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            // Retry with new token
            const newToken = getAccessToken()
            processedConfig.headers = {
              ...processedConfig.headers,
              Authorization: `Bearer ${newToken}`,
            }
            continue
          } else {
            // Redirect to login
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
            throw new Error("Session expired. Please login again.")
          }
        }

        let data: T
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          data = (await response.text()) as unknown as T
        }

        let result: ApiResponse<T> = {
          data,
          status: response.status,
          ok: response.ok,
        }

        // Run response interceptors
        for (const interceptor of this.responseInterceptors) {
          result = await interceptor(result)
        }

        if (!result.ok) {
          const errorMessage =
            typeof data === "object" && data && "message" in data
              ? (data as { message: string }).message
              : `API Error: ${response.status}`
          throw new Error(errorMessage)
        }

        // Cache successful GET requests
        if (processedConfig.method === "GET") {
          this.setCache(cacheKey, result.data)
        }

        return result
      } catch (error) {
        lastError = error as Error

        // Run error interceptors
        for (const interceptor of this.errorInterceptors) {
          interceptor(lastError)
        }

        // Don't retry on auth errors
        if (lastError.message.includes("Session expired")) {
          throw lastError
        }

        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }

    throw lastError
  }

  get<T>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "GET" })
  }

  post<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "POST", body })
  }

  put<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "PUT", body })
  }

  patch<T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "PATCH", body })
  }

  delete<T>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "DELETE" })
  }

  clearCache() {
    this.cache.clear()
  }

  invalidateCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      return
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

// Create API client instance with backend URL from environment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://task-manager-84ag.onrender.com"
export const apiClient = new ApiClient(API_BASE_URL)


// Add error logging interceptor
apiClient.addErrorInterceptor((error) => {
  console.error("[API Error]", error.message)
})

// Add response logging interceptor for debugging
apiClient.addResponseInterceptor((response) => {
  if (!response.ok) {
    console.error("[API Response Error]", response.status, response.data)
  }
  return response
})
