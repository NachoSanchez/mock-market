// hooks/useUser.ts
'use client';
import * as React from 'react';

export type User = {
    email: string;
    firstName?: string;
    lastName?: string;
    dob?: string; // ISO yyyy-mm-dd
} | null;

const USER_KEY = 'mm_user';

function loadUser(): User {
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        // normalizamos a la forma nueva (por si antes solo estaba {email})
        const { email, firstName, lastName, dob } = parsed as any;
        if (!email) return null;
        return { email, firstName, lastName, dob };
    } catch {
        return null;
    }
}

function saveUser(user: User) {
    if (!user) {
        localStorage.removeItem(USER_KEY);
    } else {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    window.dispatchEvent(new CustomEvent('mm:user'));
}

type Ctx = {
    user: User;
    login: (data: { email: string; password: string }) => void; // solo guarda email
    register: (data: {
        email: string;
        password: string;
        confirmPassword: string;
        dob?: string;
        firstName: string;
        lastName: string;
    }) => void; // guarda todo menos passwords
    update: (patch: Partial<NonNullable<User>>) => void;
    logout: () => void;
};

const UserContext = React.createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User>(null);

    React.useEffect(() => {
        setUser(loadUser());
        const onExternal = () => setUser(loadUser());
        window.addEventListener('storage', onExternal);
        window.addEventListener('mm:user', onExternal);
        return () => {
            window.removeEventListener('storage', onExternal);
            window.removeEventListener('mm:user', onExternal);
        };
    }, []);

    const login: Ctx['login'] = ({ email }) => {
        const next: User = { ...(loadUser() ?? {}), email };
        setUser(next);
        saveUser(next);
    };

    const register: Ctx['register'] = ({ email, dob, firstName, lastName }) => {
        const next: User = { email, dob, firstName, lastName };
        setUser(next);
        saveUser(next);
    };

    const update: Ctx['update'] = (patch) => {
        const base = loadUser() ?? { email: '' };
        const next: User = { ...base, ...patch };
        setUser(next);
        saveUser(next);
    };

    const logout = () => {
        setUser(null);
        saveUser(null);
    };

    const value: Ctx = { user, login, register, update, logout };
    return <UserContext.Provider value={ value }> { children } </UserContext.Provider>;
}

export function useUser() {
    const ctx = React.useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within <UserProvider>');
    return ctx;
}
