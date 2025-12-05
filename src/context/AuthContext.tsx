import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth';
import { Alert } from 'react-native';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isGuest: boolean;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
    continueAsGuest: () => void;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        checkUser();

        const { data: { subscription } } = authService.onAuthStateChange((user) => {
            setUser(user);
            if (user) {
                setIsGuest(false);
            }
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string): Promise<boolean> => {
        try {
            const { user, error } = await authService.signIn(email, password);
            if (error) {
                Alert.alert('Chyba', error.message);
                return false;
            }
            setUser(user);
            setIsGuest(false);
            return true;
        } catch (error) {
            console.error('Sign in error:', error);
            Alert.alert('Chyba', 'Nepodarilo sa prihlásiť');
            return false;
        }
    };

    const signUp = async (email: string, password: string): Promise<boolean> => {
        try {
            const { user, error } = await authService.signUp(email, password);
            if (error) {
                Alert.alert('Chyba', error.message);
                return false;
            }
            setUser(user);
            setIsGuest(false);
            return true;
        } catch (error) {
            console.error('Sign up error:', error);
            Alert.alert('Chyba', 'Nepodarilo sa vytvoriť účet');
            return false;
        }
    };

    const signInWithGoogle = async (): Promise<boolean> => {
        try {
            const { error } = await authService.signInWithGoogle();
            if (error) {
                Alert.alert('Chyba', error.message);
                return false;
            }

            // Wait for Supabase to establish the session
            await new Promise(resolve => setTimeout(resolve, 500));

            // Manually fetch and set the user to ensure immediate state update
            const currentUser = await authService.getCurrentUser();

            if (currentUser) {
                setUser(currentUser);
                setIsGuest(false);
            }

            return true;
        } catch (error) {
            console.error('Google sign in error:', error);
            Alert.alert('Chyba', 'Nepodarilo sa prihlásiť cez Google');
            return false;
        }
    };

    const signOut = async () => {
        try {
            await authService.signOut();
            setUser(null);
            setIsGuest(false);
        } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Chyba', 'Nepodarilo sa odhlásiť');
        }
    };

    const continueAsGuest = () => {
        setIsGuest(true);
        setLoading(false);
    };

    const value: AuthContextType = {
        user,
        loading,
        isGuest,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        continueAsGuest,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
