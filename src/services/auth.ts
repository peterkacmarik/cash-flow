import { supabase } from './supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

export interface AuthResponse {
    user: User | null;
    session: Session | null;
    error: AuthError | null;
}

export const authService = {
    // Sign up with email and password
    async signUp(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        return {
            user: data.user,
            session: data.session,
            error,
        };
    },

    // Sign in with email and password
    async signIn(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return {
            user: data.user,
            session: data.session,
            error,
        };
    },

    // Sign in with Google
    async signInWithGoogle(): Promise<{ error: AuthError | null }> {
        try {
            // Generate the redirect URL for Expo Go
            const redirectUrl = makeRedirectUri({
                path: 'auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

                if (result.type === 'success' && result.url) {
                    // Parse parameters from the URL
                    const url = new URL(result.url);
                    const code = url.searchParams.get('code');
                    const hash = url.hash.substring(1);

                    // Handle Implicit Flow (tokens in hash)
                    if (hash) {
                        const params = new URLSearchParams(hash);
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');

                        if (access_token && refresh_token) {
                            const { error: sessionError } = await supabase.auth.setSession({
                                access_token,
                                refresh_token,
                            });
                            if (sessionError) throw sessionError;
                            return { error: null };
                        }
                    }

                    // Handle PKCE Flow (code in query params)
                    if (code) {
                        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
                        if (sessionError) throw sessionError;
                        return { error: null };
                    }
                }
            }

            return { error: null };
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            return { error: error as AuthError };
        }
    },

    // Sign out
    async signOut(): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get current session
    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Reset password
    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'cashflow://auth/reset-password',
        });
        return { error };
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (user: User | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ?? null);
        });
    },
};
