export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
