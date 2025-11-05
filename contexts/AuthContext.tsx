
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile, UserSettings } from '../types';
import { api } from '../services/api';
import { LoadingIcon } from '../components/icons';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    userSettings: UserSettings | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const [{ data: profileData }, { data: settingsData }] = await Promise.all([
                    api.getOwnProfile(),
                    api.getOwnSettings()
                ]);
                setProfile(profileData || null);
                setUserSettings(settingsData || null);
            } else {
                setProfile(null);
                setUserSettings(null);
            }
        };

        fetchUserData();
    }, [user]);

    const signOut = async () => {
        await api.signOut();
        setProfile(null);
        setUserSettings(null);
    };

    if (loading) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <LoadingIcon className="h-12 w-12 text-blue-600" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, userSettings, loading: loading || (!!session && (!profile || !userSettings)), signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
