import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'https://lfibaygcxftjdkmuigim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaWJheWdjeGZ0amRrbXVpZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTUxNTQsImV4cCI6MjA4MDQzMTE1NH0.akNJbGabhMq7TN5pUFZ0MXHAhZskOUhu_XUJTypf3dA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
