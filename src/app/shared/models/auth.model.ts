export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    access_token: string;
    user: User;
  };
}
