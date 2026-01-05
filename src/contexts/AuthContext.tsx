import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('jasmey_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('jasmey_user');
            }
        }
        setIsLoading(false);
    }, []);

    // Auto-logout after 30 minutes of inactivity
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const resetTimeout = () => {
            if (timeout) clearTimeout(timeout);
            if (user) {
                timeout = setTimeout(() => {
                    logout();
                }, 30 * 60 * 1000); // 30 minutes
            }
        };

        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetTimeout));

        resetTimeout();

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimeout));
        };
    }, [user]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { apiClient } = await import('../api/client');
            const user = await apiClient.post('/users/login', { email, password });

            // Adaptation for frontend User type vs backend response
            const userData: User = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                addresses: user.addresses || [],
                orders: [], // Will be fetched separately
                totalOrders: 0,
                totalSpent: 0,
                joinedAt: user.joined_at,
                password: '', // Legacy field requirement
            };

            setUser(userData);
            localStorage.setItem('jasmey_user', JSON.stringify(userData));
            localStorage.setItem('jasmey_lastLogin', new Date().toISOString());
            toast.success(`Welcome back, ${user.name}!`, {
                icon: '👋',
            });
            return true;
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Invalid email or password');
            return false;
        }
    };

    const signup = async (
        name: string,
        email: string,
        password: string,
        phone: string
    ): Promise<boolean> => {
        try {
            const { apiClient } = await import('../api/client');
            await apiClient.post('/users/', {
                name,
                email,
                password,
                phone
            });

            // Auto login after signup
            return await login(email, password);
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('Signup failed. Email might already be registered.');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('jasmey_user');
        localStorage.removeItem('jasmey_lastLogin');
        toast.success('Logged out successfully');
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
