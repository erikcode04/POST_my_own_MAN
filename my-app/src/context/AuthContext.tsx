import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    avatar: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    token: null,
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

function parseJwt(token: string): User | null {
    try {
        return JSON.parse(atob(token.split('.')[1])) as User;
    } catch {
        return null;
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Handle redirect back from /auth/callback?token=...
        const params = new URLSearchParams(window.location.search);
        const callbackToken = params.get('token');
        if (callbackToken) {
            localStorage.setItem('auth_token', callbackToken);
            // Clean the URL without a full reload
            window.history.replaceState({}, '', window.location.pathname);
            applyToken(callbackToken);
            return;
        }

        // Restore from localStorage on refresh
        const stored = localStorage.getItem('auth_token');
        if (stored) applyToken(stored);
    }, []);

    function applyToken(t: string) {
        const parsed = parseJwt(t);
        if (!parsed) return;
        setToken(t);
        setUser(parsed);
    }

    function logout() {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, token, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
