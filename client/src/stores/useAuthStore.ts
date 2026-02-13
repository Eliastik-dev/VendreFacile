import { create } from 'zustand';
import { authService, type User, type LoginDto, type RegisterDto } from '../services/authService';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginDto) => Promise<void>;
    register: (data: RegisterDto) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null,

    login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(credentials);
            set({
                user: {
                    id: response.userId,
                    email: response.email,
                    firstName: '',
                    lastName: '',
                    role: response.role,
                    createdAt: new Date().toISOString(),
                },
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    },

    register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });
        try {
            await authService.register(data);
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Registration failed',
                isLoading: false,
            });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: () => {
        const user = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        set({ user, isAuthenticated });
    },
}));
