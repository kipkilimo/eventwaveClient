export interface LoginCredentials {
  eventSecret: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}
