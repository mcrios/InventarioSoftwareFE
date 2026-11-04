import { http } from '@/lib/httpClient';
import { ApiResponse, LoginRequest, LoginResponse } from '@/types/api';

export const authService = {
  login: async (credentials: LoginRequest) => {
    // Tipamos fuertemente la respuesta que esperamos del backend
    const response = await http.post<LoginResponse>('/auth/login', credentials);
    
    // Si es exitoso, guardamos el token tanto en localStorage como en cookie (para el middleware)
    if (response.success && response.data.token) {
    //   localStorage.setItem('token', response.data.token);
      document.cookie = `token=${response.data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  },

  verificarRoles: async () => {
    return http.get<object>('/test/roles');
  },
};