import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/coreinventory/api';

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number>;
}

class HttpClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Si guardas el token en cookies para el middleware, podemos leerlo de ahí o de localStorage
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    return match ? match[2] : localStorage.getItem('token');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, params, headers, ...customOptions } = options;

    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [key, val]) => {
          acc[key] = String(val);
          return acc;
        }, {})
      );
      url += `?${searchParams.toString()}`;
    }

    const authToken = token || this.getAuthToken();

    // 1. Usamos el objeto nativo Headers para fusionar todo sin errores de tipos
    const requestHeaders = new Headers(headers);

    // 2. Aseguramos el Content-Type por defecto si no viene especificado
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    // 3. Inyectamos el Token si existe y no fue sobrescrito
    if (authToken && !requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await fetch(url, {
      ...customOptions,
      headers: requestHeaders,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
      const json: ApiResponse<T> = await response.json();
      return json;
    }

    return {
      success: response.ok,
      message: response.statusText ? `HTTP ${response.status}: ${response.statusText}` : `HTTP ${response.status}`,
      data: null as T,
      timestamp: new Date().toISOString(),
    };
  }

  // Métodos reutilizables envueltos limpiamente
  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const http = new HttpClient();