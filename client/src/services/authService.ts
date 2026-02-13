import { apiClient } from './api';

export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
}

export const authService = {
    async register(data: RegisterDto): Promise<User> {
        const response = await apiClient.post<User>('/api/v1/register', data);
        return response.data;
    },

    async login(data: LoginDto): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/api/v1/login', data);
        const { accessToken, ...user } = response.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        return response.data;
    },

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },
};
