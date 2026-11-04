export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}



// Response types
export interface LoginResponse {
  token: string;
  email: string;
}